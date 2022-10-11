declare namespace Unsplash {

    export interface ProfileImage {
        small: string;
        medium: string;
        large: string;
    }

    export interface Links {
        self: string;
        html: string;
        photos: string;
        likes: string;
        portfolio: string;
    }

    export interface User {
        id: string;
        username: string;
        name: string;
        portfolio_url: string;
        bio: string;
        location: string;
        total_likes: number;
        total_photos: number;
        total_collections: number;
        instagram_username: string;
        twitter_username: string;
        profile_image: ProfileImage;
        links: Links;
    }

    export interface CurrentUserCollection {
        id: number;
        title: string;
        published_at: Date;
        last_collected_at: Date;
        updated_at: Date;
        cover_photo?: unknown;
        user?: unknown;
    }

    export interface Urls {
        raw: string;
        full: string;
        regular: string;
        small: string;
        thumb: string;
    }

    export interface Links2 {
        self: string;
        html: string;
        download: string;
        download_location: string;
    }

    export interface Photo {
        id: string;
        created_at: Date;
        updated_at: Date;
        width: number;
        height: number;
        color: string;
        blur_hash: string;
        likes: number;
        liked_by_user: boolean;
        description: string;
        alt_description: string;
        user: User;
        current_user_collections: CurrentUserCollection[];
        urls: Urls;
        links: Links2;
    }

  export interface RootObject {
    results: Photo[];
    total: number;
    total_pages: number;
  }

}

