const nodes ={
    "inputNumber": (context) => {
        nodeBuilder = context.instantiate("input-plugin","inputNumber");
        nodeBuilder.setTitle("Input number");
        nodeBuilder.setDescription("Provides a number input and returns a single number output");

        nodeBuilder.define((input, uiInput, from) => {
            return {"res": 3};
        });
       nodeBuilder.addOutput("Number", "res", "Result");

       ui = nodeBuilder.createUIBuilder();
    //    ui.addNumberInput("input number",0);
       ui.addButton({},"return 66;")
        .addSlider(
            {
                componentId: "slideAlong",
                label: "Slide Along",
                defaultValue: 0,
                updateBackend: true,
            },
            { min: 0, max: 100, set: 0.1 }
        );

    },
    "inputImage": (context) => {
      nodeBuilder = context.instantiate("input-plugin","inputImage");
      nodeBuilder.setTitle("Input image");
      nodeBuilder.setDescription("Provides an image input and returns a single image output");

      nodeBuilder.define(async (input, uiInput, from) => {

          return { "res": "/home/klairgo/Pictures/Wallpapers/fa179b9d86c74ec7bbd2ac095f7ed4d7.jpeg"};
      });
     nodeBuilder.addOutput("Image", "res", "Result");

     ui = nodeBuilder.createUIBuilder();
     ui.addImageInput("input image");
  },
  // Will we define a color type? or just a vector4/string 
  "inputColor": (context) => {
    nodeBuilder = context.instantiate("input-plugin","inputColor");
    nodeBuilder.setTitle("Input color");
    nodeBuilder.setDescription("Provides a color input and returns a single color output");

    nodeBuilder.define((color) => {
        return color;
    });
   nodeBuilder.addOutput("Color", "res", "Result");

   ui = nodeBuilder.createUIBuilder();
   ui.addColorPicker("input number",0);
},
}


const commands = {}


const tiles = {}

module.exports = {
    nodes,
    commands,
    tiles
};