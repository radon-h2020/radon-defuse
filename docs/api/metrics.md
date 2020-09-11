# api/metrics

Allows to extract source code properties from YAML blueprint.


****

**URL**

```/api/metrics/all```

List information about the Ansible metrics.

**METHOD**

```GET```


**RESPONSE**

**Success response**

A success response returns a JSON array of ```(metric, description)``` pairs.
For example

Code: 200

Content: 
```json
[
    "num_plays": "Number of plays",
    "num_tasks": "Number of tasks,
    ...
]
```


****

**URL**

```/api/metrics/run_all```

Extract metrics from an Ansible blueprint.

**METHOD**

```POST```


**BODY**

```plain/text```

A plain YAML, for example:

```yaml
---
- host: all
  tasks:
  - name: "A task"
    debug: 
      msg: "Hello World!"
```

**RESPONSE**

**Success response**

A success response returns a JSON file consisting of ```(metric, value)``` pairs.

For example

Code: 200

Content: 
```json
{
    "num_plays": 1,
    "num_tasks": 1,
    ...
}
```