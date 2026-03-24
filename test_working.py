import cloudinary
import cloudinary.uploader

print("Testing Cloudinary...")

cloudinary.config(
    cloud_name="aishcloud",
    api_key="519394657282751",
    api_secret="Vs-9mwPYKGsgBP7PuJc85QISlLU",
    secure=True
)

print("Cloud name: aishcloud")
print("API Key: 519394657282751")

try:
    print("Attempting upload...")
    result = cloudinary.uploader.upload("https://picsum.photos/200/300")
    print("SUCCESS!")
    print("URL:", result["secure_url"])
except Exception as e:
    print("ERROR:", e)

print("Test complete")