- Start Date: 2019-09-12
- RFC PR: currently https://github.com/elastic/kibana/pull/45081
- Kibana Issue: (leave this empty)

See also issue https://github.com/elastic/kibana/issues/45083, which is an
umbrella issue tracking ongoing initial work.


# Summary

For the Make It Action alerting / action plugins, we will need a way to
persist data regarding alerts and actions, for UI and investigative purposes.
We're referring to this persisted data as "events", and will be persisted to
a new elasticsearch index referred to as the "event log".

Example events are actions firing, alerts running their scheduled functions,
alerts scheduling actions to run, etc.

This functionality will be provided in a new NP plugin `event_log`, and will
provide server-side plugin APIs to write to the event log, and run queries
against it. We'll also want some query capability exposed as an HTTP endpoint.

The current clients for the event log are the actions and alerting plugins,
however the event log currently has nothing specific to them, and is general
purpose, so can be used by any plugin to "log events".

We currently assume that there may be many events logged, and that (some) customers
may not be interested in "old" events, and so to keep the event log from
consuming too much disk space, we'll set it up with ILM and some kind of
reasonable default policy that can be customized by the user.  This implies
also the use of rollver, setting a write index alias upon rollover, and
that searches for events will be done via an ES index pattern / alias to search
across event log indices with a wildcard.

# Basic example

When an action is executed, an event should be written to the event log.

Here's a [`kbn-action` command](https://github.com/pmuellr/kbn-action) to
execute a "server log" action (writes a message to the Kibana log):

```console
$ kbn-action execute d90f5563-ab7c-4292-b56d-c68166c09a59 '{message: hallo}'
{
    "status": "ok"
}
```

Here's the event written to the event log index:

```json
{
  "_index": ".kibana-event-log-000001",
  "_type": "_doc",
  "_id": "d2CXT20BPOpswQ8vgXp5",
  "_score": 1,
  "_source": {
    "timestamp": "2019-09-20T16:53:12.177Z",
    "pluginId": "actions",
    "spaceId": "default",
    "username": "elastic",
    "type": "action",
    "subType": "executed",
    "data": {
      "actionId": "d90f5563-ab7c-4292-b56d-c68166c09a59",
      "actionTypeId": ".server-log",
      "config": {},
      "params": {
        "message": "hallo"
      },
      "description": "server-log",
      "result": {
        "status": "ok"
      }
    }
  }
}
```


# Motivation

The existing designs for Make It Action describe UIs which show some amount
of alert "history".  Up till now, we had no where to write this history,
and so a new elasticsearch index is required for that.  Because we already
have two known clients of this plugin, which are related but different,
the design of the event documents is very generic, which means it could easily
be used by other plugins that would like to record "events", for the same
general purposes.


# Detailed design

## API

```typescript
export interface IEventLog {
  registerEventType(eventType: string, subTypes: string[]): void;
  getEventTypes(): Map<string, Set<string>>;

  registerTags(tags: string[]): void;
  getTags(): Set<string>;

  getLogger(properties: Partial<IEvent>): IEventLogger;

  searchEvents(search: any): Promise<any>;
}

export interface IEventLogger {
  logEvent(properties: Partial<IEvent>): void;
}

export interface IEvent {
  timestamp: Date;
  spaceId: string;
  username: string;
  pluginId: string;
  type: string;
  subType: string;
  tags: string[];
  data: any;
}
```

The plugin exposes an `IEventLog` object to plugins that pre-req it.  Those
plugins need to call `registerEventType()` and `registerTags()` to indicate
the values of the `type`, `subType`, and `tags` values they will be using
when logging events.

The pre-registration helps in two ways:

- dealing with misspelled values
- constraining the values that will end up being indexed; for example, we
  probably don't want people creating tags that contain a lot of uuids, or
  dates, etc, to prevent high cardinality issues with the index.

Once the values are registered, the plugin will get an `IEventLogger` instance
by passing in a set of default properties to be used for all it's logging,
to the `getLogger()` method. For instance, the `actions` plugin creates a
logger with it's plugin id and the only `type` value that it uses.

The `IEventLogger` object can be cached at the plugin level and accessed by
any code in the plugin.  It has a single method to write an event log entry,
`logEvent()`, which is passed specific properties for the event.

The final data written is a combination of the data passed to `getLogger()` when
creating the logger, and the data passed on the `logEvent()` call, and then
that result is validated to ensure it's complete and valid.  Errors will be
logged to the server log.

The `logEvent()` method returns no values, and is itself not asynchronous. 
It's a "call and forget" kind of thing.  The method itself will arrange 
to have the ultimate document written to the index asynchrnously.  It's designed
this way because it's not clear what a client would do with a result from this
method, nor what it would do if the method threw an error.  All the error
processing involved with getting the data into the index is handled internally,
and logged to the server log as appropriate.


## Stored data

The elasticsearch index for the event log will have ILM and rollover support,
as customers may decide to only keep recent event documents, wanting indices
with older event documents deleted, turned cold, frozen, etc.  We'll supply
some default values, but customers will be able to tweak these.

The index template for these indices looks like this:

```js
export function getIndexTemplate(esNames: EsNames, ilmExists: boolean) {
  const mapDate = { type: 'date' };
  const mapObject = { type: 'object', enabled: false };
  const mapKeyword = { type: 'keyword', ignore_above: 256 };

  return {
    index_patterns: [esNames.indexPattern],
    aliases: {
      [esNames.alias]: {
        is_write_index: true
      },
    },
    settings: {
      number_of_shards: 1,
      number_of_replicas: 1,
      'index.lifecycle.name': esNames.ilmPolicy,
      'index.lifecycle.rollover_alias': esNames.alias,
    },
    mappings: {
      dynamic: 'strict',
      properties: {
        timestamp: mapDate,
        type: mapKeyword,
        subType: mapKeyword,
        pluginId: mapKeyword,
        spaceId: mapKeyword,
        username: mapKeyword,
        tags: mapKeyword,
        data: mapObject,
      },
    },
  };
}
```

See [ilm rollover action docs][] for more info on the `is_write_index`, and `index.lifecycle.*` properties.

[ilm rollover action docs]: https://www.elastic.co/guide/en/elasticsearch/reference/current/_actions.html#ilm-rollover-action

Of particular note in the `mappings`:

- `dynamic: 'strict'` implies users can't add new fields
- all the `properties` are indexed, except `data` which contains event-specific
  data, and so event-specific data is not directly searchable

Long-term we may want a story where event log clients can add their own
mappings in some new field `object` field that we do enable for indexing.  Not
clear if that's required yet.

From the "Basic Example" above, you can see that the action execution records
everything about the action itself and it's execution - action id, description,
config, **not the secrets** _of course_ :-), the action execution parameters,
and the result of the execution.  Complete denormalization.  Whether or not
this is appropriate or not is TBD, but seems like it might be fine.


## ILM setup

We'll want to provide default ILM policy, this seems like a reasonable first
attempt:

```
PUT _ilm/policy/event_log_policy   
{
  "policy": {                       
    "phases": {
      "hot": {                      
        "actions": {
          "rollover": {             
            "max_size": "5GB",
            "max_age": "30d"
          }
        }
      }
    }
  }
}
```

This means that ILM would "rollover" the current index, say
`.kibana-event-log-000001` by creating a new index `.kibana-event-log-000002`,
which would "inherit" everything from the index template, and then ILM will
set the write index of the the alias to the new index.  This would happen
when the original index grew past 5 GB, or was created more than 30 days ago.

For more relevant information on ILM, see:
[getting started with ILM doc][] and [write index alias behavior][]:

[getting started with ILM doc]: https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-index-lifecycle-management.html
[write index alias behavior]: https://www.elastic.co/guide/en/elasticsearch/reference/master/indices-rollover-index.html#indices-rollover-is-write-index


# Drawbacks

TBD


# Alternatives

## Using Saved Objects instead of a new index

There are some potential advantages to using Saved Objects instead of a new
index as the persistence store:

- setup would be easier, compared to the setup required using a new index
  with ILM, etc
- support for per-event indexed properties 
- support for migrations
- potential use of references to link events together (eg, an alert will
  write a log entry for scheduling an action to run, and that action execution
  also writes a log entry, so would be nice to "link" them together)
- any other good things Saved Objects gives us

On the other hand, there are some known unknowns:

- how would ILM rollover and Kibana migrations work, when both want to "own"
  the index name suffix of rolled-over / migrated indices
- not clear if we will need more elaborate querying than Saved Objects
  provides
- unknown unknowns, since the attempt at impplementing a saved object persistence
  solution was never completed (and it was getting pretty complicated)

## Concern with overlap with eventual audit log capability

In an early review, concern was raised that there is a lot of overlap with
where we eventually be with audit logging.

The issues with that are:

- audit logs are currently just an `audit-log` tag on messages written to the
  standard Kibana log; there is no infrastructure to allow them to be queried

- security differences; the users able to read audit logs are probably much
  more constrained than users that need to be able to read these event logs

So, we don't really have an _alternative_ here, but ... a lot of overlap.
Long-term, it may make sense to make the eventual audit logging code 
parameterizable, so that the core code could be used for other purposes, like
this event log.  We're just not there yet.  Or implement the audit log with
the event log :-)

## Write to a events to a file and ingest via FileBeat

This came up as _"why don't we use our own stuff to do this since that's what
it's designed for"_.  Yup!  However, the only thing that really changes over
writing our index is:

- we'd write to some other log (could be console.log, or a file) instead of
  an index, directly
- we'd have to arrange to run FileBeat alongside Kibana, ingesting these
  logged events, which would send them into elasticsearch

We still need to arrange to initialize all the elasticsearch resources (ilm,
index template, etc).

The big kicker though is: where would we right these that FileBeat could
find them?  Writing to a file might be problematic for users that run 
Kibana with no writable file system, including folks using docker-based
deployments.

Lots of unknown unknowns, it seems.

Interestingly enough, this kind of story might work out extremely well for
Elastic Cloud, where we have a lot more control over the deployments!

# Adoption strategy

If we implement this proposal, how will existing Kibana developers adopt it? Is
this a breaking change? Can we write a codemod? Should we coordinate with
other projects or libraries?

The API surface has been kept to a minimum to make it easy for other plugins
make use of it.  But that's just a nice-to-have right now anyway, since 
the only known clients will be actions and alerting.


# How we teach this

**What names and terminology work best for these concepts and why? How is this
idea best presented? As a continuation of existing Kibana patterns?**

"event" and "log" are probably the most controversial names in use here.
Previously, we've referred to this as an "audit log" or "history log".
Audit log is not a great name due to the existance of the audit logging
facility already available in Kibana.  History or History log seems like
a closer fit.  Event log works for me, as it provides just a touch more
information than history - it's a history of events - but of course "events"
as suitable vague enough that it doesn'tt add thatt much more.

**Would the acceptance of this proposal mean the Kibana documentation must be
re-organized or altered? Does it change how Kibana is taught to new developers
at any level?**

no

**How should this feature be taught to existing Kibana developers?**

Follow examples of other plugins using it.

The API surface is very small, it's designed to be easy for other developers
to reuse.


# Unresolved questions

**Optional, but suggested for first drafts. What parts of the design are still
TBD?**

- Will we need more indexable fields in the event documents?

- Will we need a way to link events together; for example, an alert schedules
  an action to run, so at least two related events will be written, with no
  direct (eg, indexable) linkage between them currently possible.

- What do do when writing a log event document to an index encounters an
  error relating to elasticsearch being down.  Long-term we want to buffer
  these in a file, but we should have some short-term solution until we get
  there.  Will probably mean providing a bounded queue of event documents
  to be written when elasticsearch is available again.

  Not a great story, but it's also not clear, in practice, how many events
  will need to be logged when elasticsearch is down.  For the most part,
  anything getting logged for actions and alerting will happen AFTER an
  elasticsearch-related query anyway, meaning ... there just may not be
  that many cases where this would happen in real life.  We may in fact
  need to do something special about "elasticsearch is down" kind of 
  errors - like specifically tell plugin users to not create such events -
  as they could cause a thundering herd issue when in fact elasticsearch
  goes down.  Will be some fun experiments to run!