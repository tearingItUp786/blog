module.exports = plop => {
  plop.setGenerator("til", {
    description: "Create a brand new TIL",
    prompts: [
      {
        type: "input",
        name: "title",
        message: "What is your TIL title",
      },
      {
        type: "input",
        name: "date",
        message: "What is the date of this TIL",
      },
      {
        type: "list",
        name: "tag",
        message: "What tag is this TIL associated with?",
        choices: [
          "JS",
          "CSS",
          "Random",
          "React",
          "Backend",
          "Node",
          "Best Practices",
          "Cool Tech",
          "Other",
        ],
      },
      {
        when: function(answers) {
          return answers.tag === "Other"
        },
        type: "input",
        name: "tag",
        message: "What is your custom tag",
      },
    ],
    actions: [
      {
        // Add a new file
        type: "add",
        // Path for the new file
        path: "content/til/{{ dashCase title }}/{{ dashCase title }}.mdx",
        // Handlebars template used to generate content of new file
        templateFile: "src/plop-templates/til.mdx.hbs",
      },
    ],
  })
}
