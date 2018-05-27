const St = imports.gi.St;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const Volume = imports.ui.status.volume;

function myLog(msg) {
    // pour debugger: journalctl /usr/bin/gnome-shell -f | grep jpleau
    log("jpleau: " + msg);
}

class AudioOutputSwitcher extends PanelMenu.Button {
    constructor() {
        super(0.5, "Audio Sink Switcher");

        this._mixer = Volume.getMixerControl();

        this._outputsSection = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this._outputsSection);

        this._icon = new St.Icon({
            icon_name: "audio-headphones-symbolic",
            style_class: 'system-status-icon'
        });

        this.actor.add_actor(this._icon);

        let self = this;

        this._mixer.connect("state-changed", function() {
            self._createOutputsSection();
        });

        this.menu.connect("open-state-changed", function(menu, isOpen) {
            if (isOpen) {
                self._createOutputsSection();
            }
        });
    }

    destroy() {
        super.destroy();
    }

    _createOutputsSection() {
        this._outputsSection.removeAll();

        let sinks = this._mixer.get_sinks();

        let default_sink = this._mixer.get_default_sink();
        let self = this;

        for (let i = 0; i < sinks.length; i++) {
            let sink = sinks[i];
            
            let item = new PopupMenu.PopupMenuItem(sink.get_description());
            this._outputsSection.addMenuItem(item);

            item.label_actor = this._icon;
            item.sink = sink

            if (sink == default_sink) {
                item.setOrnament(PopupMenu.Ornament.DOT);
            }

            item.connect("activate", function(actor, event) {
                self._mixer.set_default_sink(actor.sink);
            });
        }
    }

};

let _indicator;

function enable() {
    _indicator = new AudioOutputSwitcher;
    Main.panel.addToStatusArea('audio-sink-switcher', _indicator, 0, 'center');
}

function disable() {
    _indicator.destroy();
    _indicator = null;
}