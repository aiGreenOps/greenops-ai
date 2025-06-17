function getDeltaDescription(dateString) {
    if (!dateString) return "not available";

    const today = new Date();
    const date = new Date(dateString);
    const days = Math.floor((today - date) / (1000 * 60 * 60 * 24));

    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.round(days / 30.44)} months ago`;
    return `${Math.round(days / 365.25)} years ago`;
}

module.exports = { getDeltaDescription };
