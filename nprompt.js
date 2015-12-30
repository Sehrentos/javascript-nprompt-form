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
								o[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
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

	// New 2015 not working in IE yet.
	//var settings = Object.assign(defaults, options);
	// Custom function extend(destination, source)
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

	settings.remove = function(t) {
		return t.parentNode.removeChild(t);
	};

	/* settings.promptKeydown = function(event) {
		if (event.target.nodeName.toLowerCase() === "textarea") {
			if (!event.shiftKey && event.keyCode === 13) {
				event.preventDefault();
				settings.promptSubmit(event);
			} else if (event.keyCode == 27) {
				event.preventDefault();
				settings.promptCancel(event);
			}
		} else if (event.keyCode === 13) {
			event.preventDefault();
			settings.promptSubmit(event);
		} else if (event.keyCode == 27) {
			event.preventDefault();
			settings.promptCancel(event);
		}
	}; */

	settings.promptSubmit = function(event) {
		event.preventDefault();
		var inputObject = serialize(settings.promptBody.querySelector(".nprompt_inputs"), "object");
		settings.onSubmit(inputObject);
		settings.remove(settings.promptBody);
		return this;
	};

	settings.promptCancel = function(event) {
		settings.onCancel(null);
		settings.remove(settings.promptBody);
		//settings.promptBody.removeEventListener("keydown", settings.promptKeydown, false);
		settings.promptBody.querySelector(".nprompt_inputs").removeEventListener("submit", settings.promptSubmit, false);
		settings.promptBody.querySelector(".submit_cancel").removeEventListener("click", settings.promptCancel, false);
		//window.removeEventListener("resize", settings.promptResize, false);
		return this;
	};

	/* settings.promptResize = function(event) {
		setTimeout(function() {
			settings.promptBody.querySelector(".nprompt_main").style.left = (window.innerWidth / 2 - settings.promptBody.querySelector(".nprompt_main").offsetWidth / 2) + "px";
		}, 200);
	}; */

	// Add title
	if (settings.title.length > 0) {
		settings.promptBody.querySelector(".nprompt_message").querySelector(".title").innerHTML = settings.title;
	} else {
		settings.remove( settings.promptBody.querySelector(".nprompt_message").querySelector(".title") );
	}

	// Add message
	settings.promptBody.querySelector(".nprompt_message").querySelector(".message").innerHTML = settings.message;

	// Add Submit/Cancel buttons
	var i = 0;
	var array = settings.inputSubmit;
	while (array[i]) {
		var elem = document.createElement('INPUT');
		inputElem = extend(elem, array[i]);
		settings.promptBody.querySelector(".nprompt_inputs").appendChild(inputElem);
		i++;
	}

	// Add inputs
	if (!settings.type || settings.type === "prompt") {
		var i = 0;
		var array = settings.input;
		while (array[i]) {
			var value = array[i];
			var type = array[i].type || "text";
			switch (type) {
				case "textarea":
					var elem = document.createElement('TEXTAREA');
					inputElem = extend(elem, array[i]);
					inputElem.className = array[i].className || "nprompt_value";
					// Insert before submit and cancel button
					settings.promptBody.querySelector(".nprompt_inputs").insertBefore(inputElem, settings.promptBody.querySelector(".nprompt_inputs").childNodes[settings.promptBody.querySelector(".nprompt_inputs").childNodes.length-2]);
				break;
				case "radio":
				case "checkbox":
					var elem = document.createElement('INPUT');
					inputElem = extend(elem, array[i]);
					inputElem.id = array[i].id || Math.random();
					inputElem.className = array[i].className || "nprompt_value";
					var newElement = document.createElement("P");
					
					var newItem = document.createElement("LABEL");
					newItem.htmlFor = inputElem.id;
					newItem.innerHTML = array[i].desc || "";
					
					newElement.appendChild(inputElem);
					newElement.appendChild(newItem);
					
					var newItem = document.createElement("BR");
					newElement.appendChild(newItem);
					// Insert before submit and cancel button
					settings.promptBody.querySelector(".nprompt_inputs").insertBefore(newElement, settings.promptBody.querySelector(".nprompt_inputs").childNodes[settings.promptBody.querySelector(".nprompt_inputs").childNodes.length-2]);
				break;
				default:
					var elem = document.createElement('INPUT');
					inputElem = extend(elem, array[i]);
					//inputElem.id = array[i].id || Math.random();
					inputElem.className = array[i].className || "nprompt_value";
					// Insert before submit and cancel button
					settings.promptBody.querySelector(".nprompt_inputs").insertBefore(inputElem, settings.promptBody.querySelector(".nprompt_inputs").childNodes[settings.promptBody.querySelector(".nprompt_inputs").childNodes.length-2]);
				break;
			}
			i++;
		}
	}

	// Hide cancel button
	if (settings.type !== "prompt" && settings.type !== "confirm") {
		settings.promptBody.querySelector(".submit_cancel").style.display = "none";
	}

	// Bind event click submit
	settings.promptBody.querySelector(".nprompt_inputs").addEventListener("submit", settings.promptSubmit, false);

	// Bind event keydown
	//settings.promptBody.addEventListener("keydown", settings.promptKeydown, false);

	// Bind event click cancel
	settings.promptBody.querySelector(".submit_cancel").addEventListener("click", settings.promptCancel, false);

	// Resize window event
	//window.addEventListener("resize", settings.promptResize, false);

	// Append to the body
	document.body.appendChild(settings.promptBody);

	// Enable/Disable background
	if (settings.background) {
		//settings.promptBody.classList.remove("disabled");
		//settings.promptBody.classList.add("enabled");
		settings.promptBody.querySelector(".nprompt_background").className.replace(" disabled", "");
		settings.promptBody.querySelector(".nprompt_background").className += " enabled";
	} else {
		//settings.promptBody.classList.remove("enabled");
		//settings.promptBody.classList.add("disabled");
		settings.promptBody.querySelector(".nprompt_background").className.replace(" enabled", "");
		settings.promptBody.querySelector(".nprompt_background").className += " disabled";
	}

	// Display
	settings.promptBody.querySelector(".nprompt_background").style.display = "block";

	// Center (should be done in CSS)
	//settings.promptBody.querySelector(".nprompt_main").style.left = (window.innerWidth / 2 - settings.promptBody.querySelector(".nprompt_main").offsetWidth / 2) + "px";

	// Focus
	if (settings.type === false || settings.type === "prompt") {
		settings.promptBody.querySelector(".nprompt_value").focus();
		settings.promptBody.querySelector(".nprompt_value").select();
	} else {
		settings.promptBody.querySelector(".submit_ok").focus();
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