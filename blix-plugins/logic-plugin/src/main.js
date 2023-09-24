const nodes ={
    "not": (context) => {
        nodeBuilder = context.instantiate("Logic","not");
        nodeBuilder.setTitle("Not");
        nodeBuilder.setDescription("Performs Boolean NOT operation on a single input and returns a single output");

        // (anchorInputs: { [key: AnchorId]: any }, uiInputs: { [key: UIComponentId]: any }) => { [key: AnchorId]: any }
        nodeBuilder.define((anchorInputs, uiInputs, requiredOutputs) => {
            const boolIn = anchorInputs.in ?? false;
            return { res: !boolIn };
        });

        nodeBuilder.addInput("boolean", "in","In");
        nodeBuilder.addOutput("boolean", "res","Result");
    },
    "logic": (context) => {
        const nodeBuilder = context.instantiate("Logic", "logic");
        nodeBuilder.setTitle("Logic");
        nodeBuilder.setDescription("Performs a logical operation (AND/OR/XOR) on two inputs and returns a single output");
      
        nodeBuilder.define((anchorInputs, uiInputs, requiredOutputs) => {
          const operation = uiInputs?.operation ?? "and";
          const boolA = anchorInputs.boolA ?? false;
          const boolB = anchorInputs.boolB ?? false;
          switch (operation) {
            case "and": return { res: boolA && boolB  }
            case "or": return { res: boolA || boolB  }
            case "xor": return { res: boolA !== boolB }
          }
        });

        const ui = nodeBuilder.createUIBuilder();
        ui.addDropdown({
            componentId: "operation",
            label: "Operation",
            defaultValue: 0,
            triggerUpdate: true,
        }, {
          options: {
            "And": "and",
            "Or": "or",
            "Xor": "xor",
          }
        });

        nodeBuilder.setUI(ui);
      
        nodeBuilder.addInput("boolean", "boolA", "A");
        nodeBuilder.addInput("boolean", "boolB", "B");
        nodeBuilder.addOutput("boolean", "res", "Result");
      },
    "compare": (context) => {
        const nodeBuilder = context.instantiate("Logic", "compare");
        nodeBuilder.setTitle("Compare");
        nodeBuilder.setDescription("Performs a comparison operation (==/!=/>/</>=/<=) on two inputs and returns a single boolean output");
      
        nodeBuilder.define((anchorInputs, uiInputs, requiredOutputs) => {
          // const state = Math.min(uiInputs?.state ?? 0, 4);
          const operation = uiInputs?.state ?? ">";
          const valA = anchorInputs.valA;
          const valB = anchorInputs.valB;
          switch (operation) {
            case ">": return { res: valA  >  valB }
            case ">=": return { res: valA  >= valB }
            case "<": return { res: valA  <  valB }
            case "<=": return { res: valA  <= valB }
            case "=": return { res: valA === valB }
          }
        });

        const ui = nodeBuilder.createUIBuilder();
        ui.addDropdown({
            componentId: "operation",
            label: "Operation",
            defaultValue: 0,
            triggerUpdate: true,
        }, {
          options: {
            ">": ">",
            "≥": ">=",
            "<": "<",
            "≤": "<=",
            "=": "=",
          }
        });

        nodeBuilder.setUI(ui);
      
        nodeBuilder.addInput("number", "valA", "A");
        nodeBuilder.addInput("number", "valB", "B");
        nodeBuilder.addOutput("boolean", "res", "Result");
      },
    "ternary": (context) => {
        const nodeBuilder = context.instantiate("Logic","ternary");
        nodeBuilder.setTitle("Ternary Comp.");

        nodeBuilder.define((anchorInputs, uiInputs, requiredOutputs) => {
          const cond = anchorInputs.cond ?? false;
          const valT = anchorInputs.valT;
          const valF = anchorInputs.valF;
          return { "res" : cond ? valT : valF };
        });

      nodeBuilder.addInput("boolean","condition", "Condition");
      nodeBuilder.addInput("","valT", "Value True");
      nodeBuilder.addInput("","valF", "Value False");
      nodeBuilder.addOutput("","res", "Result");
    }
}


const commands = {}


const tiles = {}

module.exports = {
    nodes,
    commands,
    tiles
};