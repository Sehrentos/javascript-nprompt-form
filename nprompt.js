/**
 * Pure JS: Custom prompt, confirm, alert
 * @nprompt( options )
 * @nconfirm( options )
 * @nalert( options )
 * Browser support(tested): IE9+, Mozilla/5.0 Gecko Firefox/38, Chrome/47
  options = {
 	title: string,					-optional
 	message: string,				-optional
 	input: array[object],			-optional(npromt required)
 	background: true/false,			-optional
 	onSubmit: callback,				-optional
 	onCancel: callback				-optional
 }
 * input example:
 options.input = [{
 	"type": "text",
 	"name": "test1",
 	"placeholder": "Test 1",
 	"required": "true"
 }]
 */
var nprompt = function(options, pType) {

	// DOM ready: "interactive" || "complete"
	if (document.readyState === "loading") {
		console.log("DOM is not ready!");
		return;
	}

	// Default settings
	var defaults = {
		type: pType || "prompt",
		title: "",
		message: "",
		input: [{
			name: "a",
			value: "",
			placeholder: "Write here...",
			className: "nprompt_value"
		}],
		inputSubmit: [{
			type: "submit",
			className: "submit_ok",
			value: "Ok"
		},{
			type: "button",
			className: "submit_cancel",
			value: "Cancel"
		}],
		background: false,
		promptBody: document.createElement("DIV"),
		onSubmit: function() {},
		onCancel: function() {}
	};

	/*
	* Serialize form function
	* @form - target id
	* @return object
	* Browser support(tested): IE/9+, Mozilla/5.0 Gecko Firefox/38, Chrome/47
	*/
	var serialize = function(form) {
		if (!form || form.nodeName !== "FORM") {
			return;
		}
		var i, j, o = {};
		for (i = 0; i < form.elements.length; i++) {
			if (form.elements[i].name === "") {
				continue
			}
			switch (form.elements[i].nodeName) {
				case "INPUT":
					switch (form.elements[i].type) {
						case "text":
						case "hidden":
						case "password":
						case "button":
						case "reset":
						case "submit":
						//HTML5
						case "number":
						case "color":
						case "range":
						case "date":
						case "month":
						case "week":
						case "time":
						case "datetime":
						case "datetime-local":
						case "email":
						case "search":
						case "tel":
						case "url":
							o[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
						break;
						case "checkbox":
						case "radio":
							if (form.elements[i].checked) {
								o[form.elements[i].name] = encodeURIComponent(form.elements[i].value); //on
							} else {
								o[form.elements[i].name] = encodeURIComponent("off");
							}
						break;
						case "file":
						break;
					}
				break;
				case "TEXTAREA":
					o[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
				break;
				case "SELECT":
					switch (form.elements[i].type) {
						case "select-one":
							o[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
						break;
						case "select-multiple":
							for (j = 0; j < form.elements[i].options.length; j++) {
								if (form.elements[i].options[j].selected) {
									o[form.elements[i].name] = encodeURIComponent(form.elements[i].options[j].value);
								}
							}
						break;
					}
				break;
				case "BUTTON":
					switch (form.elements[i].type) {
						case "reset":
						case "submit":
						case "button":
							o[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
						break;
					}
				break;
			}
		}
		return o;
	};

	/*
	* Extend - Object merge function
	* Browser support(tested): IE9+, Mozilla/5.0 Gecko Firefox/38, Chrome/47
	*/
	var extend = function(destination, source) {
		for (var property in source) {
			if (source[property] && source[property].constructor &&
			 source[property].constructor === Object) {
				destination[property] = destination[property] || {};
				arguments.callee(destination[property], source[property]);
			} else {
				destination[property] = source[property];
			}
		}
		return destination;
	};

	/*
	* Remove element
	*/
	var remove = function(t) {
		return t.parentNode.removeChild(t);
	};

	/*
	* Submit event
	*/
	var npromptSubmit = function(event) {
		event.preventDefault();
		var inputObject = serialize(settings.promptBody.querySelector(".nprompt_inputs"), "object");
		settings.onSubmit(inputObject);
		remove(settings.promptBody);
		return this;
	};

	/*
	* Cancel event
	*/
	var npromptCancel = function(event) {
		settings.onCancel(null);
		remove(settings.promptBody);
		settings.promptBody.querySelector(".nprompt_inputs").removeEventListener("submit", npromptSubmit, false);
		settings.promptBody.querySelector(".submit_cancel").removeEventListener("click", npromptCancel, false);
		return this;
	};

	/*
	* Merge defaults and options into settings object.
	* New 2015 not working in IE yet.
	* var settings = Object.assign(defaults, options);
	* Custom function extend(destination, source)
	*/
	var settings = extend(defaults, options);

	// Append promptBody element settings
	settings.promptBody.className = "nprompt_holder";
	settings.promptBody.innerHTML = '<div class="nprompt_background"></div>' +
		'<div class="nprompt_main">' +
		'<div class="nprompt_inner">' +
		'<div class="nprompt_message">' +
		'<p class="title"></p>' +
		'<p class="message"><p>' +
		'</div>' +
		'<form class="nprompt_inputs"></form>' +
		'</div>' +
		'</div>';

	// Update DOM and Display
	try {
		// DOM Add title
		if (settings.title.length > 0) {
			settings.promptBody.querySelector(".nprompt_message").querySelector(".title").innerHTML = settings.title;
		} else {
			remove( settings.promptBody.querySelector(".nprompt_message").querySelector(".title") );
		}

		// DOM Add message
		settings.promptBody.querySelector(".nprompt_message").querySelector(".message").innerHTML = settings.message;

		// DOM Add Submit and Cancel buttons
		var i = 0,
			array = settings.inputSubmit,
			npromptInputs = settings.promptBody.querySelector(".nprompt_inputs");

		while (array[i]) {
			var newInput = document.createElement('INPUT');
			newInput = extend(newInput, array[i]);
			npromptInputs.appendChild(newInput);
			i++;
		}

		// DOM Add inputs
		if (!settings.type || settings.type === "prompt") {
			var i = 0,
				value,
				type,
				array = settings.input;
			
			while (array[i]) {
				value = array[i];
				type = array[i].type || "text";
				switch (type) {
					case "textarea":
						var newInput = document.createElement('TEXTAREA');
						newInput = extend(newInput, array[i]);
						newInput.className = array[i].className || "nprompt_value";
						
						// Insert before submit and cancel button
						npromptInputs.insertBefore(newInput, npromptInputs.childNodes[npromptInputs.childNodes.length-2]);
						break;
						
					case "radio":
					case "checkbox":
						var newInput = document.createElement('INPUT');
						newInput = extend(newInput, array[i]);
						newInput.id = array[i].id || Math.random();
						newInput.className = array[i].className || "nprompt_value";
						var newElement = document.createElement("P");
						
						var newItem = document.createElement("LABEL");
						newItem.htmlFor = newInput.id;
						newItem.innerHTML = array[i].desc || "";
						
						newElement.appendChild(newInput);
						newElement.appendChild(newItem);
						
						newItem = document.createElement("BR");
						newElement.appendChild(newItem);
						
						// Insert before submit and cancel button
						npromptInputs.insertBefore(newElement, npromptInputs.childNodes[npromptInputs.childNodes.length-2]);
						break;
					
					default:
					case "text":
						var newInput = document.createElement('INPUT');
						newInput = extend(newInput, array[i]);
						newInput.className = array[i].className || "nprompt_value";
						
						// Insert before submit and cancel button
						npromptInputs.insertBefore(newInput, npromptInputs.childNodes[npromptInputs.childNodes.length-2]);
						break;
				}
				i++;
			}
		}

		// DOM Append to the body
		document.body.appendChild(settings.promptBody);

		// Bind event submit
		settings.promptBody.querySelector(".nprompt_inputs").addEventListener("submit", npromptSubmit, false);

		// Bind event click cancel
		settings.promptBody.querySelector(".submit_cancel").addEventListener("click", npromptCancel, false);

		// Bind event keydown
		//settings.promptBody.addEventListener("keydown", npromptKeydown, false);

		// CSS Hide cancel button
		if (settings.type !== "prompt" && settings.type !== "confirm") {
			settings.promptBody.querySelector(".submit_cancel").style.display = "none";
		}

		// CSS Enable/Disable background
		//.classList.remove("enabled");
		//.classList.add("disabled");
		if (settings.background) {
			settings.promptBody.querySelector(".nprompt_background").className.replace(" disabled", "");
			settings.promptBody.querySelector(".nprompt_background").className += " enabled";
		} else {
			settings.promptBody.querySelector(".nprompt_background").className.replace(" enabled", "");
			settings.promptBody.querySelector(".nprompt_background").className += " disabled";
		}

		// CSS Display (show prompt)
		settings.promptBody.querySelector(".nprompt_background").style.display = "block";

		// Event Focus and Select
		if (settings.type === false || settings.type === "prompt") {
			settings.promptBody.querySelector(".nprompt_value").focus();
			settings.promptBody.querySelector(".nprompt_value").select();
		} else {
			settings.promptBody.querySelector(".submit_ok").focus();
		}
	}
	catch(err) {
		console.log(err);
	}
	return this;
};
// New confirm event
var nconfirm = function(options) {
	return nprompt(options, "confirm");
};
// New alert event
var nalert = function(options) {
	return nprompt(options, "alert");
};