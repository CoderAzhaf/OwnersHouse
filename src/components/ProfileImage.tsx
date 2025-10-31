import { useState } from "react";

export default function ProfileImage() {
  const [image, setImage] = useState<string | null>(
    localStorage.getItem("profileImage")
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        localStorage.setItem("profileImage", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setImage(null);
    localStorage.removeItem("profileImage");
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-28 h-28 rounded-full border-4 border-white bg-gradient-to-tr from-blue-500 to-purple-500 flex justify-center items-center overflow-hidden cursor-pointer"
        onClick={() => document.getElementById("uploadInput")?.click()}
      >
        {image ? (
          <img src={image} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl font-bold text-white">T</span>
        )}
      </div>
      <input
        type="file"
        id="uploadInput"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
      {image && (
        <button
          onClick={handleRemove}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
        >
          Remove
        </button>
      )}
    </div>
  );
}
