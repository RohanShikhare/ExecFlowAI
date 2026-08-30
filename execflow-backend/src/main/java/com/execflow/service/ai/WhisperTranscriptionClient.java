package com.execflow.service.ai;

import com.execflow.exception.ApiException;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class WhisperTranscriptionClient implements TranscriptionClient {

    private final WebClient whisperWebClient;

    public WhisperTranscriptionClient(WebClient whisperWebClient) {
        this.whisperWebClient = whisperWebClient;
    }

    @Override
    public String transcribe(Resource audioResource, String fileName, String contentType) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("audio_file", audioResource)
                .filename(fileName)
                .contentType(MediaType.parseMediaType(contentType));

        try {
            WhisperResponse response = whisperWebClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/asr")
                            .queryParam("task", "transcribe")
                            .queryParam("output", "json")
                            .build())
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(WhisperResponse.class)
                    .block();

            if (response == null || response.text() == null || response.text().isBlank()) {
                throw new ApiException(HttpStatus.BAD_GATEWAY,
                        "The transcription service returned an empty result");
            }

            return response.text().trim();

        } catch (WebClientResponseException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "Transcription service error (" + e.getStatusCode() + "). "
                            + "Check that the audio file is valid and the Whisper service is healthy.");
        } catch (WebClientRequestException e) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not reach the transcription service. Is it running? "
                            + "Check WHISPER_SERVICE_URL and that the container is up.");
        }
    }

    /** Matches the JSON shape returned by openai-whisper-asr-webservice with output=json. */
    private record WhisperResponse(String text) {
    }
}
