// Vidéos du site. Déposez les fichiers dans public/videos/ et décrivez-les ici,
// ou ajoutez-les depuis l'admin (Contenu du site > Vidéos).
// Exemple :
//   { title: "Nos parfums", src: "/videos/parfums.mp4", poster: "/videos/parfums.jpg", product_slug: "" }
export interface SiteVideo {
  title: string;
  src: string;
  poster: string;
  product_slug: string;
}

export const LOCAL_VIDEOS: SiteVideo[] = [];
