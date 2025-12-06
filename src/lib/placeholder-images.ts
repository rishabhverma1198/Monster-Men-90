import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

const imageMap = new Map<string, ImagePlaceholder>(
    PlaceHolderImages.map(img => [img.id, img])
);

export function getPlaceholderImage(id: string): ImagePlaceholder {
    const img = imageMap.get(id);
    if (!img) {
        console.warn(`Placeholder image with id "${id}" not found.`);
        // Return a default/fallback image
        return {
            id: 'not-found',
            description: 'Image not found',
            imageUrl: 'https://placehold.co/600x400/EEE/31343C?text=Image+Not+Found',
            imageHint: 'placeholder'
        };
    }
    return img;
}
