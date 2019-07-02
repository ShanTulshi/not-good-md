function debounce(func, wait) {
	let timeout;
	return function () {
		let context = this, args = arguments;
		function later() {
			timeout = null;
			func.apply(context, args);
		}
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	}
}

// Only call hitstory.replaceState when the user is done typing
const replaceState = debounce((data, title, url) => {
	history.replaceState(data, title, url)
}, 200)

window.onload = () => {
	const compression_mode = 9;
	const showdownOpts = {
		tasklists: true,
		emoji: true,
	};
	const pakoOpts = {
		level: compression_mode,
		to: "string",
	};
	v = new Vue({
		el: "#input",
		data: {
			input: "",
		},
		methods: {
			renderMd: () => {
				document.getElementById("output").innerHTML = new showdown.Converter(showdownOpts).makeHtml(this.input.value);
				// Update query parameter
				let url = new URL(window.location.href);
				let params = url.searchParams;
				let df = pako.deflate(v.input, pakoOpts);
				df = btoa(df);
				params.set("c", encodeURIComponent(df));
				replaceState(null, "", "?" + params.toString());
			}
		},
		watch: {
			input: function() {
				Vue.nextTick(this.renderMd);
			}
		}
	});

	// Hide/Show button
	function toggleEditor(val) {
		let x = document.getElementById("input");
		if(val === true || x.style.display === "none") {
			x.style.display = "block";
			document.getElementById("hide").innerHTML = "Hide Editor";
		} else {
			x.style.display = "none";
			document.getElementById("hide").innerHTML = "Show Editor";
		}
	}
	document.getElementById("hide").onclick = toggleEditor;

	// Clear button
	document.getElementById("clear").onclick = function() {
		v.input = "";
		v.renderMd();
	};

	// Grab content from URL
	let url = new URL(window.location.href);
	let content = url.searchParams.get("c");
	const warningString = "Please make sure you trust the source of the link that brought you here. Markdown can contain inline HTML, which can be used to do powerful and malicious things. If you trust the source, click OK and the site will resume loading. If you do not, click Cancel and the site will load the default content.";
	if(content && confirm(warningString)) {
		let df = decodeURIComponent(content);
		df = atob(df);
		v.input = pako.inflate(df, pakoOpts);
		toggleEditor(false);
	} else {
		v.input = "# Your Markdown goes here";
	}
}
