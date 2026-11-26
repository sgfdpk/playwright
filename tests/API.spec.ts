import { request as playwrightRequest, test, expect } from '@playwright/test';
import { API_BASE_URL, createToken } from './tools/tools';

let bookingIds: number[] = [];

test.beforeAll(async () => {
  const healthRequest = await playwrightRequest.newContext();
  try {
    const healthResponse = await healthRequest.get(`${API_BASE_URL}/ping`);
    test.skip(
      healthResponse.status() !== 201,
      `HealthCheck returned ${healthResponse.status()} instead of 201`,
    );
  } finally {
    await healthRequest.dispose();
  }
});

test('create, update, and delete a booking through the API', async ({ request }) => {
  const token = await createToken(request, 'admin', 'password123');

  const initialIdsResponse = await request.get(`${API_BASE_URL}/booking`);
  expect(initialIdsResponse.status()).toBe(200);
  const initialBookings: Array<{ bookingid: number }> = await initialIdsResponse.json();
  bookingIds = initialBookings.map(({ bookingid }) => bookingid);

  const createResponse = await request.post(`${API_BASE_URL}/booking`, {
    data: {
      firstname: 'Jim',
      lastname: 'Brown',
      totalprice: 111,
      depositpaid: true,
      bookingdates: {
        checkin: '2026-01-01',
        checkout: '2026-01-05',
      },
      additionalneeds: 'Breakfast',
    },
  });
  expect(createResponse.status()).toBe(200);
  //const createdBooking: { bookingid: number } = await createResponse.json();
  const bookingid = (await createResponse.json()).bookingid;
  expect(bookingid).toBeDefined();

  const idsAfterCreateResponse = await request.get(`${API_BASE_URL}/booking`);
  expect(idsAfterCreateResponse.status()).toBe(200);
  const bookingsAfterCreate: Array<{ bookingid: number }> = await idsAfterCreateResponse.json();
  bookingIds = bookingsAfterCreate.map(({ bookingid }) => bookingid);
  expect(bookingIds).toContain(bookingid);

  const updateResponse = await request.patch(`${API_BASE_URL}/booking/${bookingid}`, {
    headers: {
      Cookie: `token=${token}`,
    },
    data: {
      firstname: 'James',
    },
  });
  expect(updateResponse.status()).toBe(200);
  //const updatedBooking: { firstname: string } = await updateResponse.json();
  expect((await updateResponse.json()).firstname).toBe('James');

  const getUpdatedBookingResponse = await request.get(`${API_BASE_URL}/booking/${bookingid}`);
  expect(getUpdatedBookingResponse.status()).toBe(200);
  //const fetchedBooking: { firstname: string } = await getUpdatedBookingResponse.json();
  expect((await getUpdatedBookingResponse.json()).firstname).toBe('James');

  const deleteResponse = await request.delete(`${API_BASE_URL}/booking/${bookingid}`, {
    headers: {
      Cookie: `token=${token}`,
    },
  });
  expect(deleteResponse.status()).toBe(201);

  const idsAfterDeleteResponse = await request.get(`${API_BASE_URL}/booking`);
  expect(idsAfterDeleteResponse.status()).toBe(200);
  const bookingsAfterDelete: Array<{ bookingid: number }> = await idsAfterDeleteResponse.json();
  bookingIds = bookingsAfterDelete.map(({ bookingid }) => bookingid);
  expect(bookingIds).not.toContain(bookingid);

  //const getDeletedBookingResponse = await request.get(`${API_BASE_URL}/booking/${bookingid}`);
  expect((await request.get(`${API_BASE_URL}/booking/${bookingid}`)).status()).toBe(404);
});

test('update a booking with checkout before checkin update', async ({ request }) => {
  const token = await createToken(request, 'admin', 'password123');

  const initialIdsResponse = await request.get(`${API_BASE_URL}/booking`);
  expect(initialIdsResponse.status()).toBe(200);
  const initialBookings: Array<{ bookingid: number }> = await initialIdsResponse.json();
  bookingIds = initialBookings.map(({ bookingid }) => bookingid);

  const createResponse = await request.post(`${API_BASE_URL}/booking`, {
    data: {
      firstname: 'Jim',
      lastname: 'Brown',
      totalprice: 111,
      depositpaid: true,
      bookingdates: {
        checkin: '2026-01-01',
        checkout: '2026-01-05',
      },
      additionalneeds: 'Breakfast',
    },
  });
  expect(createResponse.status()).toBe(200);
  const bookingid = (await createResponse.json()).bookingid;
  expect(bookingid).toBeDefined();

  const idsAfterCreateResponse = await request.get(`${API_BASE_URL}/booking`);
  expect(idsAfterCreateResponse.status()).toBe(200);
  const bookingsAfterCreate: Array<{ bookingid: number }> = await idsAfterCreateResponse.json();
  bookingIds = bookingsAfterCreate.map(({ bookingid }) => bookingid);
  expect(bookingIds).toContain(bookingid);

  const updateResponse = await request.patch(`${API_BASE_URL}/booking/${bookingid}`, {
    headers: {
      Cookie: `token=${token}`,
    },
    data: {
      bookingdates: {
        checkin: '2026-01-05',
        checkout: '2026-01-01',
      },
    },
  });
  expect.soft(updateResponse.status()).not.toBe(200);
  expect((await updateResponse.json()).bookingdates).toEqual({
    checkin: '2026-01-01',
    checkout: '2026-01-05',
  });
});

test('create, update, and delete a booking with basic auth', async ({ request }) => {
  const basicAuth = 'Basic YWRtaW46cGFzc3dvcmQxMjM=';

  const initialIdsResponse = await request.get(`${API_BASE_URL}/booking`);
  expect(initialIdsResponse.status()).toBe(200);
  const initialBookings: Array<{ bookingid: number }> = await initialIdsResponse.json();
  bookingIds = initialBookings.map(({ bookingid }) => bookingid);

  const createResponse = await request.post(`${API_BASE_URL}/booking`, {
    data: {
      firstname: 'Jim',
      lastname: 'Brown',
      totalprice: 111,
      depositpaid: true,
      bookingdates: {
        checkin: '2026-01-01',
        checkout: '2026-01-05',
      },
      additionalneeds: 'Breakfast',
    },
  });
  expect(createResponse.status()).toBe(200);
  const bookingid: number = (await createResponse.json()).bookingid;

  const idsAfterCreateResponse = await request.get(`${API_BASE_URL}/booking`);
  expect(idsAfterCreateResponse.status()).toBe(200);
  const bookingsAfterCreate: Array<{ bookingid: number }> = await idsAfterCreateResponse.json();
  bookingIds = bookingsAfterCreate.map(({ bookingid }) => bookingid);
  expect(bookingIds).toContain(bookingid);

  const updateResponse = await request.patch(`${API_BASE_URL}/booking/${bookingid}`, {
    headers: {
      Authorization: basicAuth,
    },
    data: {
      bookingdates: {
        checkin: '2026-01-05',
        checkout: '2026-01-01',
      },
    },
  });
  expect(updateResponse.status()).toBe(200);

  const deleteResponse = await request.delete(`${API_BASE_URL}/booking/${bookingid}`, {
    headers: {
      Authorization: basicAuth,
    },
  });
  expect(deleteResponse.status()).toBe(201);
});

test('create booking with checkout before checkin returns non-200', async ({ request }) => {
  await createToken(request, 'admin', 'password123');

  const initialIdsResponse = await request.get(`${API_BASE_URL}/booking`);
  expect(initialIdsResponse.status()).toBe(200);
  const initialBookings: Array<{ bookingid: number }> = await initialIdsResponse.json();
  bookingIds = initialBookings.map(({ bookingid }) => bookingid);

  const createResponse = await request.post(`${API_BASE_URL}/booking`, {
    data: {
      firstname: 'Jim',
      lastname: 'Brown',
      totalprice: 111,
      depositpaid: true,
      bookingdates: {
        checkin: '2026-01-05',
        checkout: '2026-01-01',
      },
      additionalneeds: 'Breakfast',
    },
  });
  expect(createResponse.status()).not.toBe(200);
});

test('create, update, and delete a booking through the API wrong credentials', async ({ request }) => {
  const token = (await createToken(request, 'not_admin', 'not_password123')) ?? 'undefined';

  const initialIdsResponse = await request.get(`${API_BASE_URL}/booking`);
  expect(initialIdsResponse.status()).toBe(200);
  const initialBookings: Array<{ bookingid: number }> = await initialIdsResponse.json();
  bookingIds = initialBookings.map(({ bookingid }) => bookingid);

  const createResponse = await request.post(`${API_BASE_URL}/booking`, {
    data: {
      firstname: 'Jim',
      lastname: 'Brown',
      totalprice: 111,
      depositpaid: true,
      bookingdates: {
        checkin: '2026-01-01',
        checkout: '2026-01-05',
      },
      additionalneeds: 'Breakfast',
    },
  });
  expect(createResponse.status()).toBe(200);
  const createdBooking: { bookingid: number } = await createResponse.json();
  const bookingid = createdBooking.bookingid;
  expect(bookingid).toBeDefined();

  const idsAfterCreateResponse = await request.get(`${API_BASE_URL}/booking`);
  expect(idsAfterCreateResponse.status()).toBe(200);
  const bookingsAfterCreate: Array<{ bookingid: number }> = await idsAfterCreateResponse.json();
  bookingIds = bookingsAfterCreate.map(({ bookingid }) => bookingid);
  expect(bookingIds).toContain(bookingid);

  const updateWithoutTokenResponse = await request.patch(`${API_BASE_URL}/booking/${bookingid}`, {
    data: {
      firstname: 'James',
    },
  });
  expect.soft(updateWithoutTokenResponse.status()).toBe(403);
  expect.soft((await (await request.get(`${API_BASE_URL}/booking/${bookingid}`)).json()).firstname).toBe('Jim');
  
  const updateResponse = await request.patch(`${API_BASE_URL}/booking/${bookingid}`, {
    headers: {
      Cookie: `token=${token}`,
    },
    data: {
      firstname: 'Antonio',
    },
  });
  expect.soft(updateResponse.status()).toBe(403);

  const getUpdatedBookingResponse = await request.get(`${API_BASE_URL}/booking/${bookingid}`);
  expect(getUpdatedBookingResponse.status()).toBe(200);
  expect.soft((await getUpdatedBookingResponse.json()).firstname).toBe('Jim');

  expect.soft((await request.delete(`${API_BASE_URL}/booking/${bookingid}`)).status()).toBe(403);

  const deleteResponse = await request.delete(`${API_BASE_URL}/booking/${bookingid}`, {
    headers: {
      Cookie: `token=${token}`,
    },
  });
  expect.soft(deleteResponse.status()).toBe(403);
  const getDeletedBookingResponse = await request.get(`${API_BASE_URL}/booking/${bookingid}`);
  expect(getDeletedBookingResponse.status()).toBe(200);
});

test('login with sql injection', async ({ request }) => {
  const token = await createToken(request, 'admin', '\' OR \'1\'=\'1');
  expect(token).not.toBeDefined();
});

