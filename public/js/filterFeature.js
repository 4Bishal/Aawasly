document.querySelectorAll('.filter').forEach(filter => {
    filter.addEventListener('click', () => {
        const category = filter.getAttribute('data-category');
        console.log(category);
        // Send request to backend
        fetch(`/listing/filter?category=${category}`)
            .then((res) => res.json())
            .then(data => {
                console.log('Received listings:', data);
            })
            .catch((err) => {
                console.error('Error fetching data:', err);
            });
    });
});

