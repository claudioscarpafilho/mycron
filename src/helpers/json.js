const tryConvertToJSON = (input) => {
  try {
    return JSON.parse(input)
  } catch (error) {
    return input
  }
}

const JSONToHTML = (obj, indent = 0) => {
  const indentation = ' '.repeat(indent * 4)
  const innerIndentation = ' '.repeat((indent + 1) * 4)

  if (typeof obj !== 'object' || obj === null) {
    return `${indentation}${obj}<br>\n`
  }

  let html = `${indentation}<div style="margin-left: 15px; padding-left: 5px;"><br>\n`

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      html += `${innerIndentation}<b>${key}:</b><br>\n${JSONToHTML(value, indent + 1)}`
    } else {
      html += `${innerIndentation}<b>${key}:</b> ${value}<br>\n`
    }
  }

  html += `${indentation}</div><br>\n`
  return html
}

module.exports = {
  tryConvertToJSON,
  JSONToHTML,
}
