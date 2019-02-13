import {
	onRequestProjectDetails,
	fetchProjectData
}   from './';
import { put, call, takeLatest, all } from 'redux-saga/effects';
import { cloneableGenerator } from '@redux-saga/testing-utils';
import {
	REQUEST_PROJECT_DETAILS,
	RECEIVE_PROJECT_DETAILS,
	PROJECT_DETAILS_REQUEST_FAILED
} from '../../constants/index';
import * as services from "../../utils/requests";


describe('On request project details', () => {

	const testAction = {
		type: REQUEST_PROJECT_DETAILS,
		url: 'a/url',
		contributorsUrl: '/a/contributors_url'
	};
	const testSuccessResponse = {
		contributors: [1,2,3],
		details: {foo: 'bar'}
	};

	it('gets the execution context', () => {
		const generator = cloneableGenerator(onRequestProjectDetails)(testAction);
		const result = generator.next().value;
		expect(result).toEqual(takeLatest(REQUEST_PROJECT_DETAILS, fetchProjectData));
	});

	describe('Fetch data successfully', () => {
		const generator = cloneableGenerator(fetchProjectData)(testAction);

		it('calls the API', () => {
			const result = generator.next(testAction).value;
			expect(result).toEqual(all({
				contributors: call(services.fetchProjectDetails, testAction.contributorsUrl),
				details: call(services.fetchProjectDetails, testAction.url)
			}));
		});

		it('raises success action', () => {
			const result = generator.next(testSuccessResponse).value;
			expect(result).toEqual(put({
				type: RECEIVE_PROJECT_DETAILS,
				data: { contributors: undefined, details: undefined }
			}));
		});

		it('performs no further work', () => {
			const result = generator.next().done;
			expect(result).toBe(true);
		});
	});

	describe('Throws error on failure', () => {
		const generator = cloneableGenerator(fetchProjectData)(testAction);

		it('calls the API', () => {
			const result = generator.next(testAction).value;
			expect(result).toEqual(all({
				contributors: call(services.fetchProjectDetails, testAction.contributorsUrl),
				details: call(services.fetchProjectDetails, testAction.url)
			}));
		});

		it('raises error action', () => {
			const testData = { contributors: undefined, details: undefined };
			const result = generator.next(testData).value;
			expect(result).toEqual(put({
				type: PROJECT_DETAILS_REQUEST_FAILED,
				error: 'A server error occurred! Unable to retrieve project details'
			}));
		});

		it('performs no further work', () => {
			const result = generator.next().done;
			expect(result).toBe(true);
		});
	});

});
