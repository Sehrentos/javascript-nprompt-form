javascript-nprompt-form
======================

Pure JS, custom style prompt, confirm and alert windows for browsers.

Form data is serialized on submit(optional).

### Example of use:
 - prompt

	nprompt({
		title: "My prompt",
		message: "Type something...",
		input: [{
			"type": "text",
			"name": "test1",
			"placeholder": "Test 1",
			"required": "true"
		}, {
			"type": "textarea",
			"name": "test2",
			"placeholder": "Test 2"
		}, {
			"type": "radio",
			"name": "r1",
			"desc": "Radio test"
		}, {
			"type": "checkbox",
			"name": "c1",
			"desc": "Checkbox test"
		}, {
			"type": "date",
			"name": "date"
		}],
		onSubmit: function(obj) {
			console.log(obj);
		},
		onCancel: function() {
			console.log("Event cancel");
		}
	});


Happy editing.