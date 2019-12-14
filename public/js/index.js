(() => {
    // Elements: 
    const $roomsList = document.querySelector('#rooms-list');
    const $roomInput = document.querySelector('#room');
    
    // Templates: 
    const roomLinkTemplate = document.querySelector('#room-link-template').innerHTML;

    $roomsList.addEventListener('change', (e) => {
        $roomInput.value = e.target.value;
    });

    fetch('/rooms').then(res => res.json()).then(rooms => {
        rooms.forEach(room => {
            const html = Mustache.render(roomLinkTemplate, {
                room,
            });
            $roomsList.insertAdjacentHTML('beforeend', html);
        });
    });
})();