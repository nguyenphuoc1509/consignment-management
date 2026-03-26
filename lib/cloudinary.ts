/**
 * Cloudinary upload utility.
 * Uses an unsigned upload preset for client-side uploads.
 *
 * Setup:
 *  1. Go to https://cloudinary.com/console/settings/upload
 *  2. Create an unsigned upload preset (Allow unsigned uploads = true)
 *  3. Set preset name in NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 *  4. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to .env
 */

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 10;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Chỉ chấp nhận file ảnh: JPEG, PNG, WebP, GIF.";
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Kích thước file không được vượt quá ${MAX_SIZE_MB}MB.`;
  }
  return null;
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Thiếu cấu hình Cloudinary. Vui lòng đặt NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET trong .env.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? "Upload ảnh thất bại.");
  }

  const data = (await res.json()) as {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
  };

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
}
