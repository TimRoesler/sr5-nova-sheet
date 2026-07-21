/**
 * SR5 Nova Sheet
 *
 * Registriert alternative Nova-Bögen für das shadowrun5e-System. Jeder Bogen
 * erbt die komplette Funktionalität des jeweiligen System-Actor-Bogens
 * (Würfe, Items, Edit-Modus, Drag & Drop) und ersetzt Rahmenlayout und Optik.
 *
 * - Character  → voller Cyberdeck-Header (console.hbs), Footer entfällt.
 * - Vehicle/Drohne, Spirit, Sprite, IC → generischer Cyberdeck-Header
 *   (console-actor.hbs) mit typgerechtem Keybed; der System-Footer bleibt
 *   erhalten (dort liegen die typspezifischen editierbaren Ressourcenfelder).
 */

const MODULE_ID = 'sr5-nova-sheet';
const SYSTEM_SCOPE = 'shadowrun5e';

/** Reihenfolge der Attribute im Keybed der Character-Konsole. */
const NOVA_ATTRIBUTE_ORDER = [
    'body', 'agility', 'reaction', 'strength',
    'willpower', 'logic', 'intuition', 'charisma',
    'magic', 'resonance'
];

/** Standard-Attributreihenfolge für Geister (physisch + mental). */
const SPIRIT_ATTRIBUTE_ORDER = [
    'body', 'agility', 'reaction', 'strength',
    'willpower', 'logic', 'intuition', 'charisma'
];

/**
 * Findet den (Default-)System-Actor-Bogen für einen Actor-Typ.
 * Der Registry-Key lautet "<scope>.<Klassenname>"; der Klassenname ist im
 * gebündelten System minifiziert und daher nicht vorhersagbar, deshalb wird
 * über den Scope-Präfix gesucht. Eigene Nova-Bögen (Scope MODULE_ID) werden
 * dadurch automatisch ausgeschlossen.
 */
function findSystemActorSheet(type) {
    const registered = Object.values(CONFIG.Actor?.sheetClasses?.[type] ?? {})
        .filter(entry => entry.id?.startsWith(`${SYSTEM_SCOPE}.`) && entry.cls);
    const entry = registered.find(e => e.default) ?? registered[0];
    return entry?.cls;
}

/** Wert aus einem Attribut-/Stat-Knoten oder einer nackten Zahl lesen. */
function statValue(node) {
    if (node == null) return undefined;
    return typeof node === 'object' ? node.value : node;
}

/** Keybed-Eintrag bauen; liefert null, wenn kein Wert vorhanden ist. */
function novaKey(id, short, name, value, { roll = false, tooltip } = {}) {
    if (value == null || Number.isNaN(value)) return null;
    return { id, short, name, value, roll, tooltip };
}

/**
 * Keybed + Persona-Daten pro Actor-Typ. Alle Zugriffe defensiv (optional
 * chaining), damit fehlende Felder das Sheet nie brechen.
 */
const NOVA_TYPE_BUILDERS = {
    vehicle(system) {
        const vs = system.vehicle_stats ?? {};
        const attributes = [
            novaKey('handling', 'HAN', game.i18n.localize('SR5.Vehicle.Stats.Handling'), statValue(vs.handling), { roll: true, tooltip: 'handling' }),
            novaKey('speed', 'SPD', game.i18n.localize('SR5.Vehicle.Stats.Speed'), statValue(vs.speed), { roll: true, tooltip: 'speed' }),
            novaKey('acceleration', 'ACC', game.i18n.localize('SR5.Vehicle.Stats.Acceleration'), statValue(vs.acceleration)),
            novaKey('body', 'BOD', game.i18n.localize('SR5.AttrBody'), statValue(system.attributes?.body), { roll: true, tooltip: 'body' }),
            novaKey('armor', 'ARM', game.i18n.localize('SR5.Armor.label'), statValue(system.armor?.rating) ?? statValue(system.armor)),
            novaKey('pilot', 'PIL', game.i18n.localize('SR5.Vehicle.Stats.Pilot'), statValue(vs.pilot)),
            novaKey('sensor', 'SEN', game.i18n.localize('SR5.Vehicle.Stats.Sensor'), statValue(vs.sensor))
        ];
        const idline = [game.i18n.localize('TYPES.Actor.vehicle')];
        if (system.isDrone) idline.push('DRONE');
        return { attributes, idline, readouts: [] };
    },

    spirit(system) {
        const attrs = system.attributes ?? {};
        const attributes = SPIRIT_ATTRIBUTE_ORDER
            .filter(id => attrs[id] && !attrs[id].hidden)
            .map(id => novaKey(id, localizeAttrShort(attrs[id], id), attrShortName(attrs[id], id), statValue(attrs[id]), { roll: true, tooltip: id }));
        attributes.push(novaKey('force', 'FOR', game.i18n.localize('SR5.Force'), statValue(attrs.force)));
        const idline = [game.i18n.localize('TYPES.Actor.spirit')];
        if (system.bound) idline.push('BOUND');
        const readouts = [];
        if (system.services != null) readouts.push({ label: game.i18n.localize('SR5.Spirit.Services'), value: system.services });
        return { attributes, idline, readouts };
    },

    sprite(system) {
        const matrix = system.matrix ?? {};
        const attributes = [
            novaKey('attack', 'ATK', game.i18n.localize('SR5.MatrixAttrAttack'), statValue(matrix.attack)),
            novaKey('sleaze', 'SLZ', game.i18n.localize('SR5.MatrixAttrSleaze'), statValue(matrix.sleaze)),
            novaKey('data_processing', 'DP', game.i18n.localize('SR5.MatrixAttrDataProc'), statValue(matrix.data_processing)),
            novaKey('firewall', 'FW', game.i18n.localize('SR5.MatrixAttrFirewall'), statValue(matrix.firewall)),
            novaKey('resonance', 'RES', game.i18n.localize('SR5.AttrResonance'), statValue(system.attributes?.resonance)),
            novaKey('level', 'LVL', game.i18n.localize('SR5.Sprite.Level'), statValue(system.attributes?.level))
        ];
        const idline = [game.i18n.localize('TYPES.Actor.sprite')];
        if (system.registered) idline.push('REG');
        const readouts = [];
        if (system.services != null) readouts.push({ label: game.i18n.localize('SR5.Sprite.Services'), value: system.services });
        return { attributes, idline, readouts };
    },

    ic(system) {
        const matrix = system.matrix ?? {};
        const attributes = [
            novaKey('attack', 'ATK', game.i18n.localize('SR5.MatrixAttrAttack'), statValue(matrix.attack)),
            novaKey('sleaze', 'SLZ', game.i18n.localize('SR5.MatrixAttrSleaze'), statValue(matrix.sleaze)),
            novaKey('data_processing', 'DP', game.i18n.localize('SR5.MatrixAttrDataProc'), statValue(matrix.data_processing)),
            novaKey('firewall', 'FW', game.i18n.localize('SR5.MatrixAttrFirewall'), statValue(matrix.firewall)),
            // Der Basis-Handler behandelt data-attribute-id="rating" gesondert (rollDeviceRating).
            novaKey('rating', 'RTG', game.i18n.localize('SR5.Rtg'), statValue(system.host?.rating), { roll: true })
        ];
        return { attributes, idline: [game.i18n.localize('TYPES.Actor.ic')], readouts: [] };
    }
};

/** Kurzcode (3 Zeichen) aus einem Attribut-Label ableiten. */
function localizeAttrShort(node, id) {
    return attrShortName(node, id).slice(0, 3).toUpperCase();
}

/** Voller lokalisierter Attributname für Tooltip/Titel. */
function attrShortName(node, id) {
    const key = node?.label ?? id;
    const localized = game.i18n.localize(key);
    return localized === key ? id : localized;
}

/**
 * Fabrik für einen generischen Nova-Konsolenbogen (Nicht-Character).
 * Ersetzt nur den header-Part durch console-actor.hbs; der Footer bleibt.
 */
function makeNovaActorSheet(BaseSheet, type) {
    const build = NOVA_TYPE_BUILDERS[type];

    return class SR5NovaActorSheet extends BaseSheet {
        static DEFAULT_OPTIONS = {
            classes: ['sr5-nova', 'sr5-nova-console'],
            position: { width: 1020, height: 820 }
        };

        static PARTS = {
            ...BaseSheet.PARTS,
            header: {
                template: `modules/${MODULE_ID}/templates/console-actor.hbs`,
                templates: [
                    'systems/shadowrun5e/dist/templates/v2/actor/parts/movement.hbs',
                    'systems/shadowrun5e/dist/templates/v2/actor/parts/initiative.hbs'
                ]
            }
        };

        /** @override */
        async _prepareContext(options) {
            const context = await super._prepareContext(options);
            const parts = build?.(context.system ?? {}) ?? { attributes: [], idline: [], readouts: [] };
            context.novaAttributes = (parts.attributes ?? []).filter(Boolean);
            context.novaIdline = parts.idline ?? [];
            context.novaReadouts = parts.readouts ?? [];
            return context;
        }
    };
}

// "ready" statt "init"/"setup": DocumentSheetConfig sammelt Registrierungen,
// solange game.ready false ist, und füllt CONFIG.Actor.sheetClasses erst über
// initializeSheets() – das läuft NACH dem setup- und VOR dem ready-Hook.
// Beim ready-Hook ist die System-Registrierung also sichtbar und die eigene
// wird sofort ausgeführt.
Hooks.once('ready', () => {
    const label = game.i18n.localize('SR5NOVA.SheetLabel');

    // --- Character: bewährter Cyberdeck-Header (console.hbs) ---
    const BaseCharacterSheet = findSystemActorSheet('character');
    if (BaseCharacterSheet) {
        class SR5NovaCharacterSheet extends BaseCharacterSheet {
            static DEFAULT_OPTIONS = {
                // 'sr5-nova' trägt das Neon-Theme (überall gültig), 'sr5-nova-console'
                // schaltet zusätzlich das Cyberdeck-Layout frei.
                classes: ['sr5-nova', 'sr5-nova-console'],
                position: { width: 1080, height: 840 }
            };

            // Eigenes Cyberdeck-Layout: Der "header"-Part wird zur breiten
            // Kommando-Konsole (Persona | Attribut-Keys | Vitalanzeigen).
            // Der System-Footer entfällt; seine Werte stecken im Deck-Header.
            static PARTS = (() => {
                const { footer, ...parts } = BaseCharacterSheet.PARTS;
                return {
                    ...parts,
                    header: {
                        template: `modules/${MODULE_ID}/templates/console.hbs`,
                        templates: [
                            'systems/shadowrun5e/dist/templates/v2/actor/parts/movement.hbs',
                            'systems/shadowrun5e/dist/templates/v2/actor/parts/initiative.hbs'
                        ]
                    }
                };
            })();

            /** @override */
            async _prepareContext(options) {
                const context = await super._prepareContext(options);
                context.novaAttributes = this.#prepareNovaAttributes(context);
                return context;
            }

            /**
             * Kompaktes, klickbares Attribut-Keybed für die Cyberdeck-Konsole.
             * Spiegelt die Sichtbarkeitslogik des System-Attribut-Templates
             * (versteckte Attribute wie Magie/Resonanz bei Mundanen werden ausgelassen).
             */
            #prepareNovaAttributes(context) {
                const attributes = context.system?.attributes ?? {};
                return NOVA_ATTRIBUTE_ORDER
                    .filter(id => attributes[id] && !attributes[id].hidden)
                    .map(id => {
                        const name = game.i18n.localize(attributes[id].label ?? id);
                        return {
                            id,
                            name,
                            short: name.slice(0, 3).toUpperCase(),
                            value: attributes[id].value ?? 0
                        };
                    });
            }
        }

        foundry.documents.collections.Actors.registerSheet(MODULE_ID, SR5NovaCharacterSheet, {
            types: ['character'],
            makeDefault: false,
            label
        });
    } else {
        console.error(`${MODULE_ID} | Kein ${SYSTEM_SCOPE}-Charakterbogen gefunden – Character-Nova-Bogen wird nicht registriert.`);
    }

    // --- Übrige Actor-Typen: generischer Cyberdeck-Header (console-actor.hbs) ---
    for (const type of ['vehicle', 'spirit', 'sprite', 'ic']) {
        const BaseSheet = findSystemActorSheet(type);
        if (!BaseSheet) {
            console.warn(`${MODULE_ID} | Kein ${SYSTEM_SCOPE}-Bogen für Typ "${type}" gefunden – Nova-Bogen übersprungen.`);
            continue;
        }
        foundry.documents.collections.Actors.registerSheet(MODULE_ID, makeNovaActorSheet(BaseSheet, type), {
            types: [type],
            makeDefault: false,
            label
        });
    }

    console.log(`${MODULE_ID} | Nova Sheets registriert (character, vehicle, spirit, sprite, ic).`);
});

// Neon-Look auf ALLE Shadowrun5e-Actor- und Item-Sheets legen.
// Der Core ruft Render-Hooks für jede Klasse der Vererbungskette auf; Actor-
// und Item-Sheets erben beide von DocumentSheetV2, daher deckt ein einziger
// Hook beide ab. Die Guard beschränkt auf echte Dokument-Sheets des Systems
// (nicht auf Dialoge/Manager, die dieselbe 'sr5v2'-Klasse tragen). Die
// dedizierten Konsolenbögen tragen zusätzlich 'sr5-nova-console' und bleiben so
// die reichere Variante; hier wird nur das Theme ergänzt (idempotent).
Hooks.on('renderDocumentSheetV2', (app) => {
    if (game.system?.id !== SYSTEM_SCOPE) return;
    const doc = app?.document;
    if (doc instanceof Actor || doc instanceof Item) {
        app.element?.classList.add('sr5-nova');
    }
});
