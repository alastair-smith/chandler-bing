const emphasiseWord = (word, color = '#e87085') => {
  const textNode = document.createTextNode(word)
  const italics = document.createElement('i')
  italics.setAttribute('style', `color:${color};`)
  italics.appendChild(textNode)
  return italics
}

const mapSentences = mapping => text => {
  const possibleDelimiters = ',.?!'
  const delimiters = text
    .split('')
    .filter(char => possibleDelimiters.includes(char))
    .map(delimiter => document.createTextNode(delimiter))
    .concat(document.createTextNode(''))
  const sentences = text.split(/[,.?!]/)
  return sentences
    .filter(sentence => sentence)
    .reduce((nodesSoFar, sentence, index) => {
      return nodesSoFar
        .concat(mapping(sentence))
        .concat(delimiters[index])
    }, [])
}

const replaceLastWord = (sentence, color) => {
  const words = sentence.split(' ')
  const lastWord = words.pop()
  const textStartNode = document.createTextNode(words.join(' '))
  const lastNode = emphasiseWord(` ${lastWord}`, color)
  return [ textStartNode, lastNode ]
}

const replaceBes = (sentence, color) => {
  const nodesWithoutBes = sentence
    .split(' be ')
    .map(text => document.createTextNode(text))
  return nodesWithoutBes
    .reduce((nodesSoFar, textNode, index) => {
      const withNewNode = nodesSoFar.concat(textNode)
      return index !== nodesWithoutBes.length - 1
        ? withNewNode.concat(emphasiseWord(' be ', color))
        : withNewNode
    }, [])
}

customElements.define('chandler-bing', class extends HTMLElement {
  constructor (...args) {
    super(...args)

    this.updateText = this.updateText.bind(this)

    this.updateText()

    this.isUpdating = false
    this.addEventListener('DOMNodeInserted', event => {
      if (!this.isUpdating) {
        this.isUpdating = true
        this.updateText()
        this.isUpdating = false
      }
    })
    this.addEventListener('slotChange', () => {
      this.updateText()
    })
  }

  updateText () {
    const formattedNodes = mapSentences(sentence =>
      sentence
        .trim()
        .toLowerCase()
        .startsWith('could')
        ? replaceBes(sentence, this.color)
        : sentence
          .trim()
          .toLowerCase()
          .startsWith('maybe')
          ? replaceLastWord(sentence, this.color)
          : [ document.createTextNode(sentence) ]
    )(this.childNodes[0].nodeValue.trim())

    while (this.firstChild) {
      this.removeChild(this.firstChild)
    }
    formattedNodes.forEach(node => this.appendChild(node))
  }
})
