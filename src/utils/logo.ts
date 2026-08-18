const MAX_LOGO_BYTES = 512 * 1024
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

export function readLogoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      reject(new Error('Please upload a PNG, JPG, WebP, or SVG image.'))
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      reject(new Error('Logo must be 512 KB or smaller.'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Could not read the image file.'))
      }
    }
    reader.onerror = () => reject(new Error('Could not read the image file.'))
    reader.readAsDataURL(file)
  })
}
