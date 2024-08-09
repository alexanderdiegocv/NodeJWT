import fs from 'node:fs'

export class ValidationError extends Error {
  constructor (message) {
    super(message)
    this.name = 'ValidationError'

    const error = {
      message: this.message,
      stack: this.stack
    }

    // Guardar el error en un archivo de log
    fs.appendFile('error.log', JSON.stringify(error), (err) => {
      if (err) {
        console.log(err)
      }
    })
  }
}
