import { CraftTextBlockInsert } from "@craftdocs/craft-extension-api";
import * as React from "react";
import * as ReactDOM from "react-dom";

const App: React.FC<{}> = () => {
  const isDarkMode = useCraftDarkMode();

  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  const [tableOfContents, updateTableOfContentsState] = React.useState<
    string[]
  >([]);

  const addTableOfContent = async (addToDocument: boolean) => {
    const result = await craft.dataApi.getCurrentPage();

    if (result.status !== "success") {
      throw new Error(result.message);
    }

    const pageBlock = result.data;
    const pageId = pageBlock.id;
    let textToIncludeInContents: string[] = [];
    const pageContent = pageBlock.subblocks;

    pageContent.map((block, index) => {
      if (
        block.type === "textBlock" &&
        (block.style.textStyle === "title" ||
          block.style.textStyle === "subtitle" ||
          block.style.textStyle === "heading")
      ) {
        textToIncludeInContents.push(block.content.map((x) => x.text).join());
      }
    });

    updateTableOfContentsState(textToIncludeInContents);

    if (addToDocument) {
      let blockObjectsToInsert: CraftTextBlockInsert[] = [];
      textToIncludeInContents.map((textToInclude, index) => {
        blockObjectsToInsert.push(
          craft.blockFactory.textBlock({
            content: textToInclude,
            listStyle: {
              type: "bullet",
            },
          })
        );
      });

      craft.dataApi.addBlocks(
        blockObjectsToInsert,
        craft.location.indexLocation(pageId, 0)
      );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h3 style={{ color: "white" }}>Table of Contents</h3>
      <button
        className={`btn ${isDarkMode ? "dark" : ""}`}
        onClick={() => addTableOfContent(true)}
      >
        Add to Note
      </button>
      <button
        className={`btn ${isDarkMode ? "dark" : ""}`}
        onClick={() => addTableOfContent(false)}
      >
        Show in Sidebar
      </button>
      <ul style={{ color: "white" }}>
        {tableOfContents && tableOfContents.map((value) => <li>{value}</li>)}
      </ul>
    </div>
  );
};

function useCraftDarkMode() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    craft.env.setListener((env) => setIsDarkMode(env.colorScheme === "dark"));
  }, []);

  return isDarkMode;
}

export function initApp() {
  ReactDOM.render(<App />, document.getElementById("react-root"));
}
