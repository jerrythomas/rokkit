// function handleKeyDown(e) {
// 	let isFocused = false
// 	let listOpen = false
// 	if (!isFocused) return

// 	switch (e.key) {
// 		case 'ArrowDown':
// 			e.preventDefault()
// 			listOpen = true
// 			activeValue = undefined
// 			break
// 		case 'ArrowUp':
// 			e.preventDefault()
// 			listOpen = true
// 			activeValue = undefined
// 			break
// 		case 'Tab':
// 			if (!listOpen) isFocused = false
// 			break
// 		case 'Backspace':
// 			if (!isMulti || filterText.length > 0) return
// 			if (isMulti && value && value.length > 0) {
// 				handleMultiItemClear(
// 					activeValue !== undefined ? activeValue : value.length - 1
// 				)
// 				if (activeValue === 0 || activeValue === undefined) break
// 				activeValue = value.length > activeValue ? activeValue - 1 : undefined
// 			}
// 			break
// 		case 'ArrowLeft':
// 			if (!isMulti || filterText.length > 0) return
// 			if (activeValue === undefined) {
// 				activeValue = value.length - 1
// 			} else if (value.length > activeValue && activeValue !== 0) {
// 				activeValue -= 1
// 			}
// 			break
// 		case 'ArrowRight':
// 			if (!isMulti || filterText.length > 0 || activeValue === undefined) return
// 			if (activeValue === value.length - 1) {
// 				activeValue = undefined
// 			} else if (activeValue < value.length - 1) {
// 				activeValue += 1
// 			}
// 			break
// 	}
// }
