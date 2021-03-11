# ScholarCsvToJson

This is a my first project with JavaScript/Node.js. I'm trying to convert .csv in a . json file.
Some headers are expected if exit, how "phone ..." or "email".

# Example

This input.csv:

```
fullname,eid,email Student,phone Student,"email Pedagogical Responsible","phone Pedagogical Responsible","email Financial Responsible","phone Financial Responsible",group,group,invisible,see_all

John Appleseed,104,john.appleseed@exemplo.com :(,kkkkkkk,dad.appleseed@exemplo.com,(11) 99991-1234,mom.appleseed@exemplo.com,(11) 99992-1234,Sala 1 / Sala 2,Sala 3,1,no
```

Will product this output.json:

```javascript
[
  {
    "fullname": "John Appleseed",
    "eid": "104",
    "addresses": [
      {
        "type": "email",
        "tags": [
          "Student"
        ],
        "address": "john.appleseed@exemplo.com"
      },
      {
        "type": "email",
        "tags": [
          "Pedagogical",
          "Responsible"
        ],
        "address": "dad.appleseed@exemplo.com"
      },
      {
        "type": "phone",
        "tags": [
          "Pedagogical",
          "Responsible"
        ],
        "address": "5511999911234"
      },
      {
        "type": "email",
        "tags": [
          "Financial",
          "Responsible"
        ],
        "address": "mom.appleseed@exemplo.com"
      },
      {
        "type": "phone",
        "tags": [
          "Financial",
          "Responsible"
        ],
        "address": "5511999921234"
      }
    ],
    "group": [
      "Sala 1",
      "Sala 2",
      "Sala 3"
    ],
    "invisible": "true",
    "see_all": "false"
  }
]
```
