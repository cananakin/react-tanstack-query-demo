import { Link, redirect, useNavigate, useNavigation, useParams, useSubmit } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const { id } = useParams();
  const submit = useSubmit()

  // Sumbitting updated data
  // const { mutate, isPending: isPendingEdition, isError: isErrorEditing, error: errorEdit  } = useMutation({
  //   mutationFn: updateEvent,
  //   // onSuccess: () => {
  //   //   queryClient.invalidateQueries({ queryKey: ['events']});
  //   //   navigate('/events');
  //   // }
  //   onMutate: async (data) => {
  //     const eventData = data.event;
  //     await queryClient.cancelQueries({ queryKey: ['events', id]});
  //     const previousEvent = queryClient.getQueriesData(['events', id])
      
  //     queryClient.setQueryData(['events', id], eventData);
  //     return { previousEvent }
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueriesData(['events', id], context.previousEvent)
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(['events', id])
  //   }
  // });

  // requesting the data
  const { data, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({signal}) => fetchEvent({id, signal}),
    staleTime: 10000
  })


  function handleSubmit(formData) {
    submit(formData , { method: 'PUT'});
    
  }

  function handleClose() {
    navigate('../');
  }
  console.log(data);
  
  return (
    <Modal onClose={handleClose}>
      { data && (
        <EventForm inputData={data} onSubmit={handleSubmit}>
          { state === 'submitting' ? (<p>Submitting...</p>)
          :
          (<>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>)
          }
        </EventForm>
      )}
      { isError && <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to edit event'} />}
    </Modal>
  );
}

export function loader({params}) {
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({signal}) => fetchEvent({id: params.id, signal})
  })
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updateEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updateEventData});
  await queryClient.invalidateQueries(['events']);
  return redirect('../');
}