/**
* Serialize form function
* @form - target id
* @opt - true/false optional(return URI string or object)
* Browser support(tested): IE/9+, Mozilla/5.0 Gecko Firefox/38, Chrome/47
*/
var serialize = function(form, opt) {
	if (!form || form.nodeName !== "FORM") {
		return;
	}
	var i, j, q = [], o = {}, s = opt || false;
	for (i = form.elements.length-1; i >= 0; i = i-1) {
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
						if (!s) {
							q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
						} else {
							o[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
						}
					break;
					case "checkbox":
					case "radio":
						if (form.elements[i].checked) {
							if (!s) {
								q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
							} else {
								o[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
							}
						}
					break;
					case "file":
					break;
				}
			break;
			case "TEXTAREA":
				if (!s) {
					q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
				} else {
					o[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
				}
			break;
			case "SELECT":
				switch (form.elements[i].type) {
					case "select-one":
						if (!s) {
							q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
						} else {
							o[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
						}
					break;
					case "select-multiple":
						for (j = form.elements[i].options.length-1; j >= 0; j = j-1) {
							if (form.elements[i].options[j].selected) {
								if (!s) {
									q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
								} else {
									o[form.elements[i].name] = encodeURIComponent(form.elements[i].options[j].value);
								}
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
						if (!s) {
							q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
						} else {
							o[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
						}
					break;
				}
			break;
		}
	}
	return !s ? q.join("&") : o;
};

/**
* Extend - Object extend function
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

/**
 * Custom prompt, confirm, alert
 * @prompt( options )
 * @confirm( options )
 * @alert( options )
 */
var PromptFunc = function(options) {
	// Default settings
	var defaults = {
		type: false,
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

	settings.promptKeydown = function(event) {
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
	};

	settings.promptSubmit = function(event) {
		event.preventDefault();
		var input_object = serialize(settings.promptBody.querySelector(".nprompt_inputs"), true);
		settings.onSubmit(input_object);
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

	settings.promptResize = function(event) {
		setTimeout(function() {
			settings.promptBody.querySelector(".nprompt_main").style.left = (window.innerWidth / 2 - settings.promptBody.querySelector(".nprompt_main").offsetWidth / 2) + "px";
		}, 200);
	};

	// Add title
	if (settings.title.length > 0) {
		settings.promptBody.querySelector(".nprompt_message").querySelector(".title").innerHTML = settings.title;
	} else {
		settings.remove( settings.promptBody.querySelector(".nprompt_message").querySelector(".title") );
	}

	// Add message
	settings.promptBody.querySelector(".nprompt_message").querySelector(".message").innerHTML = settings.message;

	// Add Submit/Cancel buttons
	settings.inputSubmit.forEach(function(value, index, ar) {
		var elem = document.createElement('INPUT');
		inputElem = extend(elem, ar[index]);
		settings.promptBody.querySelector(".nprompt_inputs").appendChild(inputElem);
	});

	// Add inputs
	if (!settings.type || settings.type === "prompt") {
		settings.input.forEach(function(value, index, ar) {
			var type = value.type || "text";
			switch (type) {
				case "textarea":
					var elem = document.createElement('TEXTAREA');
					inputElem = extend(elem, ar[index]);
					inputElem.className = value.className || "nprompt_value";
					// Insert before submit and cancel button
					settings.promptBody.querySelector(".nprompt_inputs").insertBefore(inputElem, settings.promptBody.querySelector(".nprompt_inputs").childNodes[settings.promptBody.querySelector(".nprompt_inputs").childNodes.length-2]);
				break;
				case "radio":
				case "checkbox":
					var elem = document.createElement('INPUT');
					inputElem = extend(elem, ar[index]);
					inputElem.id = value.id || Math.random();
					inputElem.className = value.className || "nprompt_value";
					var newElement = document.createElement("P");
					
					var newItem = document.createElement("LABEL");
					newItem.htmlFor = inputElem.id;
					newItem.innerHTML = value.desc || "";
					
					newElement.appendChild(inputElem);
					newElement.appendChild(newItem);
					
					var newItem = document.createElement("BR");
					newElement.appendChild(newItem);
					// Insert before submit and cancel button
					settings.promptBody.querySelector(".nprompt_inputs").insertBefore(newElement, settings.promptBody.querySelector(".nprompt_inputs").childNodes[settings.promptBody.querySelector(".nprompt_inputs").childNodes.length-2]);
				break;
				default:
					var elem = document.createElement('INPUT');
					inputElem = extend(elem, ar[index]);
					//inputElem.id = value.id || Math.random();
					inputElem.className = value.className || "nprompt_value";
					// Insert before submit and cancel button
					settings.promptBody.querySelector(".nprompt_inputs").insertBefore(inputElem, settings.promptBody.querySelector(".nprompt_inputs").childNodes[settings.promptBody.querySelector(".nprompt_inputs").childNodes.length-2]);
				break;
			}
		});
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

// New prompt event
var nprompt = function(options) {
	var defaults = {
		"type": "prompt"
	};
	// New 2015 not working in IE yet.
	//var settings = Object.assign(defaults, options);
	// Custom function extend(destination, source)
	var settings = extend(defaults, options);

	return PromptFunc(settings);
};

// New confirm event
var nconfirm = function(options) {
	var defaults = {
		"type": "confirm"
	};
	// New 2015 not working in IE yet.
	//var settings = Object.assign(defaults, options);
	// Custom function extend(destination, source)
	var settings = extend(defaults, options);

	return PromptFunc(settings);
};

// New alert event
var nalert = function(options) {
	var defaults = {
		"type": "alert"
	};
	// New 2015 not working in IE yet.
	//var settings = Object.assign(defaults, options);
	// Custom function extend(destination, source)
	var settings = extend(defaults, options);

	return PromptFunc(settings);
};