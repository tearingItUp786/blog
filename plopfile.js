function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear()

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day

  return [year, month, day].join('-')
}

const now = formatDate(Date.now())
module.exports = plop => {
  plop.setGenerator('til', {
    description: 'Create a brand new TIL',
    prompts: [
      {
        type: 'input',
        name: 'title',
        message: 'What is your TIL title',
      },
      {
        default: now,
        type: 'input',
        name: 'date',
        message: 'What is the date of this TIL',
      },
      {
        type: 'list',
        name: 'tag',
        message: 'What tag is this TIL associated with?',
        choices: [
          'JS',
          'CSS',
          'Random',
          'React',
          'Backend',
          'Node',
          'Best Practices',
          'Cool Tech',
          'Scala',
          'Other',
        ],
      },
      {
        when: function (answers) {
          return answers.tag === 'Other'
        },
        type: 'input',
        askAnswered: true,
        name: 'tag',
        message: 'What is your custom tag',
      },
    ],
    actions: [
      {
        // Add a new file
        type: 'add',
        // Path for the new file
        path: `content/til/${now}-{{ dashCase title }}/${now}-{{ dashCase title }}.mdx`,
        // Handlebars template used to generate content of new file
        templateFile: 'plop-templates/til.mdx.hbs',
      },
    ],
  })
}
