javascript-nprompt-form
======================

A custom style prompt, confirm and alert for browsers.

 - Prompt form is serialized and returned as object on submit.
 - HTML5, no Javascript libraries.
 - Browser support(tested): IE9+, Mozilla/5.0 Gecko Firefox/38, Chrome/47

### Example of use:
	- (prompt)

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


### JS Fiddle
 - [JSFiddle link] (https://jsfiddle.net/Sehrentos/vqjt8g62/)

Happy editing.