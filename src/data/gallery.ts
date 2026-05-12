export type GalleryItem = {
  id: string;
  type: "image" | "video";
  url: string;
  title: string;
};

export const galleryMedia: GalleryItem[] = [
  // You can add your video uploaded to Supabase here:
  {
    id: "video-1",
    type: "video",
    url: "https://vdrdrzuveznygrkwdsin.supabase.co/storage/v1/object/public/fredmak%20hostel%20media/Fredmak.mp4",
    title: "Hostel Check-in Tour"
  },
  // If you have more pictures, just copy the block below and update the details!
  {
    id: "img-1",
    type: "image",
    url: "https://vdrdrzuveznygrkwdsin.supabase.co/storage/v1/object/public/fredmak%20hostel%20media/2%20in%201%20executive.jpg",
    title: "2 in 1 Executive"
  },
  {
    id: "img-2",
    type: "image",
    url: "https://vdrdrzuveznygrkwdsin.supabase.co/storage/v1/object/public/fredmak%20hostel%20media/2%20in%201%20standard.png",
    title: "2 in 1 Standard"
  },
  {
    id: "img-3",
    type: "image",
    url: "https://vdrdrzuveznygrkwdsin.supabase.co/storage/v1/object/public/fredmak%20hostel%20media/3%20in%201%20standard.png",
    title: "3 in 1 Standard"
  }
];
