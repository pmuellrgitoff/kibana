- Start Date: 2019-09-12
- RFC PR: currently https://github.com/elastic/kibana/pull/45081
- Kibana Issue: (leave this empty)


# Summary

For the Make It Action alerting / action plugins, they will need a way to
persist data regarding alerts and actions, for UI and investigative purposes.
We're referring to this persisted data as "events", and will be persisted to
a new elasticsearch index referred to as the "event log".

Example events are mutating CRUD operations on alerts and actions, action
execution, and alert queries executed.

This functionality will be provided in a new NP plugin `event_log`, and will
provide server-side plugin APIs to write to the event log, and run queries
against it, and could grow to include some HTTP APIs to write events, and do
specialized queries (perhaps would be required for UI purposes).

The current clients for the event log are the actions and alerting plugins,
however the event log has nothing specific to them, and is general purpose.


# Basic example

When a new action is created, an event should be written to the event log.

Here's a [`kbn-action` command](https://github.com/pmuellr/kbn-action) to create
a new slack action:

```console
$ kbn-action create .slack slack {} '{webhookUrl:"https://hooks.slack.com/services/<redacted>"}'
```

Here's the JSON returned from the HTTP invocation:

```json
{
    "id": "e33a1119-3b77-4013-a56f-1bf18063da70",
    "actionTypeId": ".slack",
    "description": "slack",
    "config": {}
}
```

Here's the event written to the event log index:

```json
{
  "_index": ".kibana-event-log-000001",
  "_type": "_doc",
  "_id": "EL_YJW0BNDkrH0Vpzs2y",
  "_score": 1,
  "_source": {
    "pluginId": "actions",
    "type": "action",
    "username": "elastic",
    "spaceId": "default",
    "subType": "created",
    "data": {
      "actionTypeId": ".slack",
      "config": {},
      "description": "slack",
      "actionId": "e33a1119-3b77-4013-a56f-1bf18063da70"
    },
    "timestamp": "2019-09-12T14:20:28.720Z"
  }
}
```


# Motivation

The existing designs for Make It Action describe UIs which show some amount
of alert "history".  Up till now, we had no where to write these history,
and so a new elasticsearch index is required for that.  Because we already
have two known clients of this plugin, which are related but different,
the design of the event documents is very generic, which means it could easily
be used by other plugins that would like to record "events".


# Detailed design

The elasticsearch index for the event log will have ILM and rollover support,
as customers may decide to only keep recent event documents, wanting indices
with older event documents deleted, turned cold, frozen, etc.  We'll supply
some default values, but customers will be able to tweak these.

The index template for these indices looks like this:

```js
const mapDate = { type: 'date' };
const mapObject = { type: 'object', enabled: false };
const mapKeyword = { type: 'keyword', ignore_above: 256 };

function getIndexTemplateBody(indexPattern: string) {
  return {
    index_patterns: [indexPattern],
    settings: {
      number_of_shards: 1,
      number_of_replicas: 1,
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

# Drawbacks

Why should we *not* do this? Please consider:

- implementation cost, both in term of code size and complexity
- the impact on teaching people Kibana development
- integration of this feature with other existing and planned features
- cost of migrating existing Kibana plugins (is it a breaking change?)

There are tradeoffs to choosing any path. Attempt to identify them here.


# Alternatives

## General Info

The alternatives described below end up changing the store being written to
and read from.  While there's non-trivial code that is needed to implement
a specific store implementation, it basically boils down to initialization,
a method to write an event log entry, and a way to query the event log.

So the good news is that the shape of the event log API probably won't change
no matter what the eventual implementation is.  In fact, the serialization
mechanism could be made parameterizable, **in the future**, if required.

## Use Saved Objects

We considered using Saved Objects for this - using the technique of creating
a new elasticsearch index, but layering Saved Objects over that, much like
what has been done in Task Manager.  However, the operational patterns
of this index are wildly different than typical Saved Object patterns:

- the event log is append-only
- should allow the capability of using ILM to trim old events
  - that implies rollover, an alias, and an index template

It's not clear how well Saved Objects would work with this.  It _might_?

Saved Objects would provide built-in space- and feature-control- based
access, which at first glance you'd think we want.  However, we already
have seen UI designs that allow cross-space access to the event history,
which implies at least some of those controls from SO (eg, space-specific
event logs) wouldn't be used. If we **DO** need cross-space access to the
event log **AND** we're using SO as the persistence mechanism, **THEN** we
would create the saved object story to be space agnostic.

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
this event log.  We're just not there yet.

## Write to a events to a file and ingest via FileBeat


# Adoption strategy

If we implement this proposal, how will existing Kibana developers adopt it? Is
this a breaking change? Can we write a codemod? Should we coordinate with
other projects or libraries?


# How we teach this

What names and terminology work best for these concepts and why? How is this
idea best presented? As a continuation of existing Kibana patterns?

Would the acceptance of this proposal mean the Kibana documentation must be
re-organized or altered? Does it change how Kibana is taught to new developers
at any level?

How should this feature be taught to existing Kibana developers?


# Unresolved questions

Optional, but suggested for first drafts. What parts of the design are still
TBD?