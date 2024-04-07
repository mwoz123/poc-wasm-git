import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import lg2Initializer from "./lg2_async.js";
import { requestUrl } from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
	console.log("AAAAAAAAAAAAAAAA")
		const lg2 = await lg2Initializer(this.app.vault.adapter, requestUrl, './lg2_async.wasm');
		lg2.onRuntimeInitialized = async () => {
			/* Simple example of how it can be used */
			const FS = lg2.FS; // needs to be replaced with an obsidian filesystem
			const MEMFS = FS.filesystems.MEMFS;
			await FS.mkdir("/working");
			await FS.mount(MEMFS, {}, "/working");
			await FS.chdir("/working");
			await FS.writeFile("/home/web_user/.gitconfig", "[user]\n" + "name = Test User\n" + "email = test@example.com");
			await lg2.callMain(["clone", "https://github.com/torch2424/made-with-webassembly.git", "made-with-webassembly"]);
			var testFile = await FS.writeFile("./made-with-webassembly/test.txt", "test")
			await lg2.callMain(["--git-dir=made-with-webassembly", 'add', "test.txt"]);
			await lg2.callMain(["--git-dir=made-with-webassembly", "status"]);
			const files = await FS.readdir("made-with-webassembly");
			console.log(files);
		};
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
