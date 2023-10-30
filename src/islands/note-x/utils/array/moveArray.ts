export const moveArray = <T,>(array: T[], fromIndex: number, toIndex: number): T[] => {
  if (fromIndex < 0 || fromIndex >= array.length || toIndex < 0 || toIndex >= array.length) {
    throw new TypeError("Invalid index")
  }

  const newArray = [...array]
  
  const elementToMove = newArray.splice(fromIndex, 1)[0]
  newArray.splice(toIndex, 0, elementToMove)

  return newArray
}
