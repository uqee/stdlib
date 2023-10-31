import {
  AddressComponent,
  AddressType,
  Client,
  DirectionsRequest,
  DirectionsResponse,
  GeocodeResult,
  ReverseGeocodeRequest,
  ReverseGeocodeResponse,
  RouteLeg,
  Status,
  TimeZoneRequest,
  TimeZoneResponse,
  TimeZoneResponseData,
} from '@googlemaps/google-maps-services-js'
import { type Logger } from 'pino'

import { Float } from './Float'
import { Integer } from './Integer'
import { Timestamp } from './Timestamp'

//

export interface GoogleLocation {
  lat: Float
  lng: Float
}

//

export interface GoogleDirectionsInput {
  locationFrom: GoogleLocation
  locationTo: GoogleLocation
}

export interface GoogleDirectionsOutput {
  addressFrom: string
  addressTo: string
  routeMeters: Integer | undefined
  routeSeconds: Integer | undefined
}

//

export interface GoogleReverseGeocodeInput {
  location: GoogleLocation
}

export interface GoogleReverseGeocodeOutput {
  address: string | undefined
  city: string | undefined
  country: string | undefined
  province: string | undefined
}

//

export interface GoogleTimezoneInput {
  location: GoogleLocation
  timestamp?: Timestamp
}

export interface GoogleTimezoneOutput {
  id: string
  offsetSeconds: Integer
}

//

export class Google {
  private readonly client: Client

  public constructor(
    private readonly logger: Logger,
    private readonly GC_API_TOKEN: string,
  ) {
    this.client = new Client()
  }

  //

  public async directions(
    input: GoogleDirectionsInput,
  ): Promise<GoogleDirectionsOutput> {
    this.logger.debug(input, 'Google:directions:input')

    //

    const request: DirectionsRequest = {
      params: {
        destination: input.locationTo,
        key: this.GC_API_TOKEN,
        origin: input.locationFrom,
      },
    }

    this.logger.trace(request, 'Google:directions:request')

    //

    const response: DirectionsResponse = await this.client.directions(request)

    this.logger.trace(response.data, 'Google:directions:response.data')

    if (response.data.status !== Status.OK) {
      throw new Error('response.data.status !== Status.OK')
    }

    //

    const routeLeg: RouteLeg | undefined = response.data.routes[0].legs[0]

    const output: GoogleDirectionsOutput = {
      addressFrom: routeLeg.start_address,
      addressTo: routeLeg.end_address,
      routeMeters: routeLeg.distance.value,
      routeSeconds: routeLeg.duration.value,
    }

    this.logger.debug(output, 'Google:directions:output')

    //

    return output
  }

  public async reverseGeocode(
    input: GoogleReverseGeocodeInput,
  ): Promise<GoogleReverseGeocodeOutput> {
    this.logger.debug(input, 'Google:reverseGeocode:input')

    //

    const request: ReverseGeocodeRequest = {
      params: {
        key: this.GC_API_TOKEN,
        latlng: `${input.location.lat} ${input.location.lng}`,
      },
    }

    this.logger.trace(request, 'Google:reverseGeocode:request')

    //

    const response: ReverseGeocodeResponse =
      await this.client.reverseGeocode(request)

    this.logger.trace(response.data, 'Google:reverseGeocode:response.data')

    if (response.data.status !== Status.OK) {
      throw new Error('response.data.status !== Status.OK')
    }

    //

    const geocodeResults: GeocodeResult[] = response.data.results

    const addressGeocodeResult: GeocodeResult | undefined = //
      this.reverseGeocode_getGeocodeResult(
        geocodeResults,
        'street_address' as AddressType,
      ) ??
      this.reverseGeocode_getGeocodeResult(
        geocodeResults,
        'premise' as AddressType,
      ) ??
      this.reverseGeocode_getGeocodeResult(
        geocodeResults,
        'route' as AddressType,
      )

    const cityAddressComponent: AddressComponent | undefined = //
      this.reverseGeocode_getAddressComponent(
        geocodeResults,
        'locality' as AddressType,
      )

    const countryAddressComponent: AddressComponent | undefined = //
      this.reverseGeocode_getAddressComponent(
        geocodeResults,
        'country' as AddressType,
      )

    const provinceAddressComponent: AddressComponent | undefined = //
      this.reverseGeocode_getAddressComponent(
        geocodeResults,
        'administrative_area_level_1' as AddressType,
      )

    const output: GoogleReverseGeocodeOutput = {
      address: addressGeocodeResult?.formatted_address,
      city: cityAddressComponent?.short_name,
      country: countryAddressComponent?.short_name,
      province: provinceAddressComponent?.short_name,
    }

    this.logger.debug(output, 'Google:reverseGeocode:output')

    //

    return output
  }

  private reverseGeocode_getAddressComponent(
    geocodeResults: GeocodeResult[],
    addressType: AddressType,
  ): AddressComponent | undefined {
    const geocodeResult: GeocodeResult | undefined = //
      this.reverseGeocode_getGeocodeResult(geocodeResults, addressType)

    return geocodeResult?.address_components.find((addressComponent) =>
      addressComponent.types.includes(addressType),
    )
  }

  private reverseGeocode_getGeocodeResult(
    geocodeResults: GeocodeResult[],
    addressType: AddressType,
  ): GeocodeResult | undefined {
    return geocodeResults.find(
      (geocodeResult) => geocodeResult.types.includes(addressType), //
    )
  }

  public async timezone(
    input: GoogleTimezoneInput,
  ): Promise<GoogleTimezoneOutput> {
    this.logger.debug(input, 'Google:timezone:input')

    //

    const request: TimeZoneRequest = {
      params: {
        key: this.GC_API_TOKEN,
        location: `${input.location.lat} ${input.location.lng}`,
        timestamp: Math.round((input.timestamp ?? Date.now()) / 1000),
      },
    }

    this.logger.trace(request, 'Google:timezone:request')

    //

    const response: TimeZoneResponse = await this.client.timezone(request)

    this.logger.trace(response.data, 'Google:timezone:response.data')

    if (response.data.status !== Status.OK) {
      throw new Error('response.data.status !== Status.OK')
    }

    //

    const timeZoneResponseData: TimeZoneResponseData = response.data

    const output: GoogleTimezoneOutput = {
      id: timeZoneResponseData.timeZoneId,
      offsetSeconds:
        timeZoneResponseData.rawOffset + timeZoneResponseData.dstOffset,
    }

    this.logger.debug(output, 'Google:timezone:output')

    //

    return output
  }
}
