Generate exactly **{{KNOWLEDGE_ITEM_COUNT}}** accurate, useful, interesting daily knowledge items.

Use a varied mix of:

* vocabulary
* science
* history
* geography
* arts_culture
* technology
* general_knowledge

Keep every item **concise, clear, evergreen, and educational**.

Return **only valid JSON** in exactly this structure. Do not add fields, comments, markdown, or additional text:

{"date":"YYYY-MM-DD","items":[{"id":1,"category":"vocabulary","type":"word","title":"","content":"","question":null,"answer":null,"example":null,"source_note":null}]}

### Rules

* Generate exactly `{{KNOWLEDGE_ITEM_COUNT}}` items.
* IDs must be sequential from `1` to `{{KNOWLEDGE_ITEM_COUNT}}`.
* `category` must be one of: `vocabulary`, `science`, `history`, `geography`, `arts_culture`, `technology`, `general_knowledge`.
* `type` must be one of: `word`, `question`, `fact`, `concept`.
* For `question` items, provide both `question` and `answer`.
* For `word` items, provide a useful `example`; `source_note` may optionally be included.
* Set unused optional fields to `null`.
* Ensure every item is factually accurate and does not rely on temporary or rapidly changing information.

### Category distribution

For the default count of **10**, target an approximately balanced mix across the seven categories. Include each category whenever practical, and use no more than two items in any one category unless the configured count is too small.

If `{{KNOWLEDGE_ITEM_COUNT}}` differs from 10, scale the distribution proportionally while keeping the mix varied and avoiding unnecessary concentration in one category.

### Variety

Vary the subjects, concepts, people, discoveries, places, and examples from day to day. Avoid repeating the same fact or generating closely related facts.

The supplied previous-day content is **reference material only**. Use it to identify and avoid repeated or closely related facts, topics, concepts, and wording. **Never reproduce or closely paraphrase previous items.**

Prioritize factual accuracy, variety, and educational value over obscure or sensational facts.
