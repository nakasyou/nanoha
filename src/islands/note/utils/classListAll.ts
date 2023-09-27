export const classListAddAll = (element: Element, classes: string[]) => {
  for (const className of classes) {
    element.classList.add(className)
  }
}
export const classListRemoveAll = (element: Element, classes: string[]) => {
  for (const className of classes) {
    element.classList.remove(className)
  }
}
