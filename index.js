"use strict";

const babelify = require('babelify');
const icssify = require("icssify");
const prettyBytes = require("pretty-bytes");

const postcssPlugins = ["postcss-import", "postcss-strip-inline-comments", "postcss-nested", "postcss-simple-vars", "postcss-color-function", "autoprefixer"].map((plugin) => require(plugin)());

const browserifyConfig = {
	transform: babelify.configure({presets: ["@babel/preset-env", "@babel/preset-react"]}),
	plugin: [
		[icssify, {
			parser: require('postcss-scss'),
			before: postcssPlugins,
			mode: 'global'
		}],
		[require("css-extract"), { out: "public/bundle.css" }],
	]
};

if (process.env.NODE_ENV == "development") {
	const budo = require('budo');
	budo('./src/index.js', {
		live: true,
		port: 8080,
		browserify: browserifyConfig,
		dir: "public",
		css: "/public/bundle.css",
		wg: "src/*",
		serve: "bundle.js"
	}).on('connect', function (ev) {
		console.log('Server running on %s', ev.uri);
		console.log('LiveReload running on port %s', ev.port);
	}).on('update', function (buffer) {
		console.log('bundle - %s', prettyBytes(buffer.length));
	});
} else {
	const browserify = require("browserify");
	const fs = require("fs");
	let b = browserify(browserifyConfig);
	b.add('./src/index.js');
	let output = fs.createWriteStream("./public/bundle.js");
	b.bundle().pipe(output).on("finish", () => {
		console.log("Finished bundle");
	});
}
