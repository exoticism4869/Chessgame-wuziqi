export function throttle(func, duration) {
	let callable = true
	return function () {
		if (callable) {
			func.apply(this, arguments)
			callable = false
			setTimeout(() => {
				callable = true
			}, duration)
		}
	}
}
