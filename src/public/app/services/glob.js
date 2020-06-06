import utils from "./utils.js";
import appContext from "./app_context.js";
import server from "./server.js";
import libraryLoader from "./library_loader.js";
import ws from "./ws.js";
import protectedSessionHolder from "./protected_session_holder.js";
import treeCache from "./tree_cache.js";

function setupGlobs() {
    window.glob.PROFILING_LOG = false;

    window.glob.isDesktop = utils.isDesktop;
    window.glob.isMobile = utils.isMobile;

    window.glob.getComponentByEl = el => appContext.getComponentByEl(el);
    window.glob.getHeaders = server.getHeaders;

    // required for ESLint plugin and CKEditor
    window.glob.getActiveTabNote = () => appContext.tabManager.getActiveTabNote();
    window.glob.requireLibrary = libraryLoader.requireLibrary;
    window.glob.ESLINT = libraryLoader.ESLINT;
    window.glob.appContext = appContext; // for debugging
    window.glob.treeCache = treeCache;

    // for CKEditor integration (button on block toolbar)
    window.glob.importMarkdownInline = async () => {
        const dialog = await import("../dialogs/markdown_import.js");

        dialog.importMarkdownInline();
    };

    window.glob.SEARCH_HELP_TEXT = `
    <strong>Search tips</strong> - also see <button class="btn btn-sm" type="button" data-help-page="Search">complete help on search</button>
    <p>
    <ul>
        <li>Just enter any text for full text search</li>
        <li><code>@abc</code> - returns notes with label abc</li>
        <li><code>@year=2019</code> - matches notes with label <code>year</code> having value <code>2019</code></li>
        <li><code>@rock @pop</code> - matches notes which have both <code>rock</code> and <code>pop</code> labels</li>
        <li><code>@rock or @pop</code> - only one of the labels must be present</li>
        <li><code>@year&lt;=2000</code> - numerical comparison (also &gt;, &gt;=, &lt;).</li>
        <li><code>@dateCreated>=MONTH-1</code> - notes created in the last month</li>
        <li><code>=handler</code> - will execute script defined in <code>handler</code> relation to get results</li>
    </ul>
    </p>`;

    window.onerror = function (msg, url, lineNo, columnNo, error) {
        const string = msg.toLowerCase();

        let message = "Uncaught error: ";

        if (string.includes("Cannot read property 'defaultView' of undefined")) {
            // ignore this specific error which is very common but we don't know where it comes from
            // and it seems to be harmless
            return true;
        } else if (string.includes("script error")) {
            message += 'No details available';
        } else {
            message += [
                'Message: ' + msg,
                'URL: ' + url,
                'Line: ' + lineNo,
                'Column: ' + columnNo,
                'Error object: ' + JSON.stringify(error)
            ].join(' - ');
        }

        ws.logError(message);

        return false;
    };

    protectedSessionHolder.setProtectedSessionId(null);

    for (const appCssNoteId of glob.appCssNoteIds || []) {
        libraryLoader.requireCss(`api/notes/download/${appCssNoteId}`);
    }

    const wikiBaseUrl = "https://github.com/zadam/trilium/wiki/";

    $(document).on("click", "*[data-help-page]", e => {
        window.open(wikiBaseUrl + $(e.target).attr("data-help-page"), '_blank');
    });

    $("body").on("click", "a.external", function () {
        window.open($(this).attr("href"), '_blank');
    });
}

export default {
    setupGlobs
}
