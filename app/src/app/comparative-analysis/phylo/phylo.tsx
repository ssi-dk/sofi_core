import React, { useRef, useEffect, useCallback } from "react";
import { Box } from "@chakra-ui/react";

import createTree from "@cgps/phylocanvas/createTree";

import interactionsPlugin from "@cgps/phylocanvas-plugin-interactions/index";
import contextMenuPlugin from "@cgps/phylocanvas-plugin-context-menu/index";
import scaleBarPlugin from "@cgps/phylocanvas-plugin-scalebar/index";
import "./phylo-style.css";

function initPhylocanvas(canvas, newick, styles, onSelected) {
  return createTree(
    canvas,
    {
      source: newick,
      nodeSize: 7,
      haloWidth: 2,
      styles,
      highlightedStyle: "#34B6C7",
      haloStyle: "#34B6C7",
      tooltipcontent: (node) => {
        return `id: ${node.id}<br>
          branch length: ${node.branchlength}`;
      },
      image: "",
    },
    [
      contextMenuPlugin,
      interactionsPlugin,
      scaleBarPlugin,
      function (tree, decorate) {
        decorate("selectNode", (delegate, args) => {
          delegate(...args);
          onSelected(tree.state.selectedIds);
        });
      },
      // on view subtree
      (_, decorate) => {
        decorate("setRoot", (delegate, args) => {
          delegate(...args);
        });
      },
      // on redraw original tree/re-root tree
      (_, decorate) => {
        decorate("setSource", (delegate, args) => {
          delegate(...args);
        });
      },
    ]
  );
}

export default function Tree({
  newick_data,
  leaf_colors,
  selectedIDs,
  onSelected,
}: {
  newick_data: string;
  leaf_colors: { [index: string]: { fillStyle: string } };
  selectedIDs: Array<string>;
  onSelected: (ids) => void;
}) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const tree = useRef(null);

  const disableContextMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
  }, []);

  const updateWidthAndHeight = useCallback(() => {
    if (tree.current && canvas.current) {
      const width = canvas.current.parentElement.clientWidth;
      const height = canvas.current.parentElement.clientHeight;
      tree.current.resize(width, height);
      tree.current.resizeCanvas();
      tree.current.render();
    }
  }, [tree, canvas]);

  useEffect(() => {
    window.addEventListener("resize", updateWidthAndHeight);
    // clean up
    return () => window.removeEventListener("resize", updateWidthAndHeight);
  });

  useEffect(() => {
    if (canvas.current) {
      canvas.current.width = canvas.current.parentElement.clientWidth;
      canvas.current.height = canvas.current.parentElement.clientHeight;
      if (newick_data) {
        tree.current = initPhylocanvas(
          canvas.current,
          newick_data,
          leaf_colors,
          onSelected
        );

        tree.current.contextMenu.el.oncontextmenu = disableContextMenu;
      }
    }

    return function cleanup() {
      if (tree.current) {
        tree.current.destroy();
        console.log("tree cleanup");
      }
    };
  }, [
    leaf_colors,
    newick_data,
    onSelected,
    disableContextMenu,
  ]);

  useEffect(() => {
    if (tree.current && tree.current.state.selectedIds) {
      tree.current.setState({
        selectedIds: selectedIDs,
      });
    }
  }, [selectedIDs]);

  return (
    <Box borderRadius="2" width="100%" height="100%">
      <canvas ref={canvas} onContextMenu={disableContextMenu} />
    </Box>
  );
}
