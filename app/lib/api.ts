export async function pingBackend() {
  try {
    const response = await fetch("http://localhost:8080/ping");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error connecting to backend:", error);
    return { message: "Error connecting to backend" };
  }
}