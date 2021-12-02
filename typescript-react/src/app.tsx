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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <button
        className={`btn ${isDarkMode ? "dark" : ""}`}
        onClick={addTableOfContent}
      >
        Add Table of Content
      </button>
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

async function addTableOfContent() {
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

export function initApp() {
  ReactDOM.render(<App />, document.getElementById("react-root"));
}
