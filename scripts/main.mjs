/**
 * SR5 Nova Sheet
 *
 * Registriert einen alternativen Charakterbogen für das shadowrun5e-System.
 * Der Bogen erbt die komplette Funktionalität des System-Charakterbogens
 * (Würfe, Items, Edit-Modus, Drag & Drop) und ersetzt Rahmenlayout und Optik.
 */

const MODULE_ID = 'sr5-nova-sheet';
const SYSTEM_SCOPE = 'shadowrun5e';

/** Reihenfolge der Attribute im Keybed der Cyberdeck-Konsole. */
const NOVA_ATTRIBUTE_ORDER = [
    'body', 'agility', 'reaction', 'strength',
    'willpower', 'logic', 'intuition', 'charisma',
    'magic', 'resonance'
];

// "ready" statt "init"/"setup": DocumentSheetConfig sammelt Registrierungen,
// solange game.ready false ist, und füllt CONFIG.Actor.sheetClasses erst über
// initializeSheets() – das läuft NACH dem setup- und VOR dem ready-Hook.
// Beim ready-Hook ist die System-Registrierung also sichtbar und die eigene
// wird sofort ausgeführt.
Hooks.once('ready', () => {
    // Der Registry-Key lautet "<scope>.<Klassenname>"; der Klassenname ist im
    // gebündelten System minifiziert und daher nicht vorhersagbar. Deshalb wird
    // der (einzige) für "character" registrierte shadowrun5e-Bogen über den
    // Scope-Präfix gesucht.
    const registered = Object.values(CONFIG.Actor?.sheetClasses?.character ?? {})
        .filter(entry => entry.id?.startsWith(`${SYSTEM_SCOPE}.`) && entry.cls);
    const entry = registered.find(e => e.default) ?? registered[0];
    const BaseSheet = entry?.cls;
    if (!BaseSheet) {
        console.error(`${MODULE_ID} | Kein ${SYSTEM_SCOPE}-Charakterbogen in CONFIG.Actor.sheetClasses.character gefunden – Nova Sheet wird nicht registriert.`);
        return;
    }

    class SR5NovaCharacterSheet extends BaseSheet {
        static DEFAULT_OPTIONS = {
            // 'sr5-nova' trägt das Neon-Theme (überall gültig), 'sr5-nova-console'
            // schaltet zusätzlich das Cyberdeck-Layout frei (nur dieser Bogen).
            classes: ['sr5-nova', 'sr5-nova-console'],
            position: { width: 1080, height: 840 }
        };

        // Eigenes Cyberdeck-Layout: Der "header"-Part wird zur breiten
        // Kommando-Konsole (Persona | Attribut-Keys | Vitalanzeigen).
        // Der System-Footer entfällt; seine Werte stecken im Deck-Header.
        static PARTS = (() => {
            const { footer, ...parts } = BaseSheet.PARTS;
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
        label: game.i18n.localize('SR5NOVA.SheetLabel')
    });

    console.log(`${MODULE_ID} | Nova Sheet registriert.`);
});

// Neon-Look auf ALLE Shadowrun5e-Actor- und Item-Sheets legen.
// Der Core ruft Render-Hooks für jede Klasse der Vererbungskette auf; Actor-
// und Item-Sheets erben beide von DocumentSheetV2, daher deckt ein einziger
// Hook beide ab. Die Guard beschränkt auf echte Dokument-Sheets des Systems
// (nicht auf Dialoge/Manager, die dieselbe 'sr5v2'-Klasse tragen). Der
// dedizierte Konsolenbogen trägt zusätzlich 'sr5-nova-console' und bleibt so
// die reichere Variante; hier wird nur das Theme ergänzt (idempotent).
Hooks.on('renderDocumentSheetV2', (app) => {
    if (game.system?.id !== SYSTEM_SCOPE) return;
    const doc = app?.document;
    if (doc instanceof Actor || doc instanceof Item) {
        app.element?.classList.add('sr5-nova');
    }
});
