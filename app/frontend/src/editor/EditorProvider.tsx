import { ToolManager } from "../core/tools/ToolManager";
import { CoreEditingTool } from "../tools/core/CoreEditingTool";

export const toolManager = new ToolManager();
toolManager.register(CoreEditingTool);
console.log("Registered CoreEditingTool with ToolManager");
