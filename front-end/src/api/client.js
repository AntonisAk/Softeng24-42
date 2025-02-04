const BASE_URL = "https://localhost:9115/api";

export const apiClient = {
  async login(credentials) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to login");
    }

    return response.json();
  },

  async getDebts(token) {
    const response = await fetch(`${BASE_URL}/debts`, {
      headers: {
        "X-OBSERVATORY-AUTH": token,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch debts");
    }

    return response.json();
  },

  async payDebt(token, data) {
    const response = await fetch(`${BASE_URL}/debts/pay`, {
      method: "POST",
      headers: {
        "X-OBSERVATORY-AUTH": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.error && error.currentDebt) {
        throw { error: error.error, currentDebt: error.currentDebt };
      }
      throw new Error(error || "Failed to process payment");
    }
    return response.json();
  },

  async getOperators(token) {
    const response = await fetch(`${BASE_URL}/operators`, {
      headers: {
        "X-OBSERVATORY-AUTH": token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch cross-operator data");
    }

    return response.json();
  },

  async getCrossOpData(token, opId) {
    const response = await fetch(`${BASE_URL}/crossop/${opId}`, {
      headers: {
        "X-OBSERVATORY-AUTH": token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch cross-operator data");
    }

    return response.json();
  },

  async getTrafficData(token) {
    const response = await fetch(`${BASE_URL}/traffic`, {
      headers: {
        "X-OBSERVATORY-AUTH": token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch traffic data");
    }

    return response.json();
  },
};
