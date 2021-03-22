import React, { useRef, useEffect, useCallback } from "react";

import createTree from "@cgps/phylocanvas/createTree";

import interactionsPlugin from "@cgps/phylocanvas-plugin-interactions/index";
import contextMenuPlugin from "@cgps/phylocanvas-plugin-context-menu/index";
import scaleBarPlugin from "@cgps/phylocanvas-plugin-scalebar/index";
import * as styless from "./style.css";

function initPhylocanvas(canvas, newick, styles, actions) {
  return createTree(
    canvas,
    {
      source: newick,
      nodeSize: 7,
      haloWidth: 2,
      styles,
      highlightedStyle: "#34B6C7",
      haloStyle: "#34B6C7",
      // tooltipContent: (node) => {
      //   return `id: ${node.id}<br>
      //     branch lenght: ${node.branchLength}`
      // }
    },
    [
      contextMenuPlugin,
      interactionsPlugin, // orders matters
      scaleBarPlugin,
      function (tree, decorate) {
        decorate("selectNode", (delegate, args) => {
          delegate(...args);
          console.log("select node arg", args);
          // console.log('tree nodes', tree.nodes.leafNodes);
          console.log("selectNode");
          //const { selectedIds } = tree.state;
          // if (selectedIds && selectedIds.length) {
          //   actions.setSelectedIDs(tree.state.selectedIds);
          // } else {
          //   // const ids = tree.nodes.leafNodes.map((value) => value.id);
          //   actions.deselectIDs();
          // }
        });
      },
      // on view subtree
      function (tree, decorate) {
        decorate("setRoot", (delegate, args) => {
          delegate(...args);
          const ids = tree.nodes.leafNodes.map((value) => value.id);
          console.log("setRoot", ids, args);
          // actions.setWorkingIDs(ids);
        });
      },
      // on redraw original tree/re-root tree
      function (tree, decorate) {
        decorate("setSource", (delegate, args) => {
          delegate(...args);
          const ids = tree.nodes.leafNodes.map((value) => value.id);
          console.log("setSource", ids, args);
          // actions.setWorkingIDs(ids);
        });
      },
    ]
  );
}

export default function Tree(props: {
  newick_data: string;
  leaf_colors: { [index: string]: { fillStyle: string } };
  selectedIDs: Array<string>;
  actions: { [index: string]: Function };
}) {
  // console.log('newick_data', props.newick_data)
  // console.log('selectedIDs', props.selectedIDs)

  const canvas = useRef<HTMLCanvasElement | null>(null);
  const tree = useRef(null);

  const updateWidthAndHeight = useCallback(() => {
    if (tree.current && canvas.current) {
      const width = canvas.current.parentElement.clientWidth;
      const height = canvas.current.parentElement.clientHeight;
      tree.current.resize(width, height);
    }
  }, [tree, canvas]);

  useEffect(() => {
    window.addEventListener("resize", updateWidthAndHeight);
    //clean up
    return () => window.removeEventListener("resize", updateWidthAndHeight);
  });

  useEffect(() => {
    if (canvas.current) {
      canvas.current.width = canvas.current.parentElement.clientWidth;
      canvas.current.height = canvas.current.parentElement.clientHeight;
      if (props.newick_data) {
        tree.current = initPhylocanvas(
          canvas.current,
          props.newick_data,
          props.leaf_colors,
          props.actions
        );
        // const ids = tree.current.nodes.leafNodes.map((value) => value.id);
        // props.setWorkingIDs(ids);
        // console.log(tree.current);
      }
    }

    return function cleanup() {
      if (tree.current) {
        tree.current.destroy();
        console.log("tree cleanup");
      }
    };
  }, [props.leaf_colors, props.newick_data, props.actions]);

  useEffect(() => {
    if (tree.current && tree.current.state.selectedIds) {
      tree.current.setState({
        selectedIds: props.selectedIDs,
      });
    }
  }, [props.selectedIDs]);

  return (
    <div>
      <canvas ref={canvas} />
      <style>{`
        {
          grid-area: phylocanvas;
          border: #000 1px;
        }

        canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .phylocanvas-context-menu {
          position: absolute;
        }
      `}</style>
    </div>
  );
}
