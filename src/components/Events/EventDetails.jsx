import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';

import { useQuery, useMutation } from '@tanstack/react-query';
import Header from '../Header.jsx';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const {data, isPending, isError, error} = useQuery({
    queryKey: ['events', id],
    queryFn: ({signal}) => fetchEvent({id, signal})
  });

  const { mutate, isPending: isPendingDeletion, isError: isErrorDeleting  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['events'],
        refetchType: 'none'
      });
      navigate('/events');
    }
  });

  function handleDelete() {
    mutate({ id: id})
  }

  function handleStartDelete() {
    setIsDeleting(true);
  }
  function handleStopDelete() {
    setIsDeleting(false);
  }
  return (
    <>
    { isDeleting && (
      <Modal onClose={handleStopDelete}>
        <h2>Are you sure?</h2>
        <p>
          Do you really want to delete this event? This action cannot be undone.
        </p>
        <div className="form-actions">
            {
              isPendingDeletion ? <p>Deleting, please wait...</p>
              :
              <>
              <button onClick={handleStopDelete} className='button-text'>Cancel</button>
              <button onClick={handleDelete}  className='button'>Delete</button>
              </>
            }
        </div>
        { isErrorDeleting && <ErrorBlock title="Deleting there is error" message="There is an error for deleting" />}
      </Modal>
    )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      
      { isPending && <LoadingIndicator /> }
      { isError && <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch event'} />}
      { !isPending && data && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={handleStartDelete}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>{data.date} @ {data.time}</time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
