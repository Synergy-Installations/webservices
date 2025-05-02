"use client";

import {
  useEditor,
  EditorContent,
  EditorProvider,
  useCurrentEditor,
} from "@tiptap/react";
import React from "react";
import { EditorMenuBar } from "./EditorMenuBar";
import { IsUpdateStepLoadingState } from "../StepSubmit";

import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import YouTube from "@tiptap/extension-youtube";
import FontFamily from "@tiptap/extension-font-family";
import { useGetStepQuery } from "@com.synergy/frontend-backend-dashboard/stepApi";

/* eslint-disable-next-line */
export interface StepEditorProps {
  params: { id: string; stepId: string };
  saveStepToggle: boolean;
  setSaveStepToggle: (saveStepToggle: boolean) => void;
  editStepToggle: boolean;
  setEditStepToggle: (editStepToggle: boolean) => void;
  isUpdateStepLoading: IsUpdateStepLoadingState;
  setIsUpdateStepLoading: React.Dispatch<
    React.SetStateAction<IsUpdateStepLoadingState>
  >;
}

const CustomBold = Bold.extend({
  // Override the renderHTML method
  renderHTML({ mark, HTMLAttributes }) {
    const { style, ...rest } = HTMLAttributes;

    // Merge existing styles with font-weight
    const newStyle = "font-weight: bold;" + (style ? " " + style : "");

    return ["span", { ...rest, style: newStyle.trim() }, 0];
  },
  // Ensure it doesn't exclude other marks
  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {},
    };
  },
});

const FontSizeTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return { style: "font-size: " + attributes.fontSize };
        },
      },
    };
  },
});

export const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure(),
  StarterKit.configure({
    bold: false,
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
  CustomBold,
  FontSizeTextStyle,
  TextStyle,
  Color,
  FontSizeTextStyle,
  FontFamily,
  Highlight,
  Underline,
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Image,
  YouTube,
];

const content = `
<h2>
  Hi there,
</h2>
<p>
  this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That’s a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
</p>
<pre><code className="language-css">body {
  display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
</p>
<blockquote>
  Wow, that’s amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
`;

export const StepEditor = (props: StepEditorProps) => {
  const {
    params,
    params: { id: submitId, stepId },
    saveStepToggle,
    setSaveStepToggle,
    editStepToggle,
    setEditStepToggle,
    isUpdateStepLoading,
    setIsUpdateStepLoading,
  } = props;

  const {
    data: step,
    isLoading: isGetStepLoading,
    error,
  } = useGetStepQuery(
    { submitId: submitId, stepId: stepId },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );

  return (
    <div className="relative border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
      {/* <div className="px-4 py-2 bg-white rounded-b-lg dark:bg-gray-800">
        <label htmlFor="wysiwyg-example" className="sr-only">
          Publish post
        </label>
        <div
          id="wysiwyg-example"
          className="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
        ></div>
      </div> */}
      <EditorProvider
        slotBefore={
          <EditorMenuBar
            saveStepToggle={saveStepToggle}
            setSaveStepToggle={setSaveStepToggle}
            editStepToggle={editStepToggle}
            setEditStepToggle={setEditStepToggle}
            isUpdateStepLoading={isUpdateStepLoading}
            setIsUpdateStepLoading={setIsUpdateStepLoading}
            params={params}
          />
        }
        extensions={extensions}
        content={step?.data.step?.description || content}
        // editorContainerProps={{
        //   className:
        //     "block w-full px-4 py-2 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400",
        // }}
        editorProps={{
          attributes: {
            class:
              "format block relative px-4 py-2 text-sm bg-white border-0 focus:ring-0 focus:outline-none rounded-b-lg",
          },
        }}
      ></EditorProvider>
    </div>
  );
};

export default StepEditor;
