# api/classification/classify

Allows to detect defects in an YAML blueprint.

**URL**

```/api/classification/classify```


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

A success response returns a JSON file consisting of the following fields:

* ```defective: <boolean>``` indicating whether the script has been predicted as *defect-prone* (```true```) or *defect-free* (```false```);

* ```metrics: <object>``` consisting of a JSON object of ```(metric, value)``` pairs.

For example

Code: 200

Content: 
```json
{ 
    "defective": true,
    "metrics": {
        "num_plays": 1,
        "num_tasks": 1,
        ...
    }
}
```

**Error response**

If the content is not a valid YAML (empty or bad-formatted) the APIs return and error response.

Code: 422 UNPROCESSABLE ENTRY

Content: { error : "YAML Invalid" }

****